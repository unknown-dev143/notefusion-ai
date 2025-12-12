import { ENVIRONMENT } from '../config/environment';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error' | 'cancelled';
}

export interface UploadFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  progress: UploadProgress;
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface UploadOptions {
  endpoint: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (file: UploadFile) => void;
  onError?: (error: string, file: UploadFile) => void;
  chunkSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  resumable?: boolean;
}

export interface UploadManager {
  uploads: Map<string, UploadFile>;
  queue: UploadFile[];
  activeUploads: Set<string>;
  maxConcurrent: number;
  paused: boolean;
  
  addUpload: (file: File, options: UploadOptions) => Promise<UploadFile>;
  removeUpload: (id: string) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  cancelAll: () => void;
  clearCompleted: () => void;
  clearAll: () => void;
  getUpload: (id: string) => UploadFile | undefined;
  getUploads: () => UploadFile[];
  getActiveUploads: () => UploadFile[];
  getQueuedUploads: () => UploadFile[];
  getCompletedUploads: () => UploadFile[];
  getTotalProgress: () => UploadProgress;
}

class UploadService implements UploadManager {
  uploads = new Map<string, UploadFile>();
  queue: UploadFile[] = [];
  activeUploads = new Set<string>();
  maxConcurrent = 3;
  paused = false;
  private abortControllers = new Map<string, AbortController>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();

  // Add a new upload
  async addUpload(file: File, options: UploadOptions): Promise<UploadFile> {
    const uploadFile: UploadFile = {
      file,
      id: this.generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: {
        loaded: 0,
        total: file.size,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        status: 'pending',
      },
      metadata: options.metadata,
      createdAt: new Date(),
    };

    this.uploads.set(uploadFile.id, uploadFile);
    this.queue.push(uploadFile);

    // Start processing if not paused
    if (!this.paused) {
      this.processQueue();
    }

    return uploadFile;
  }

  // Process the upload queue
  private async processQueue(): Promise<void> {
    if (this.activeUploads.size >= this.maxConcurrent || this.paused) {
      return;
    }

    const nextUpload = this.queue.find(u => 
      u.progress.status === 'pending' || 
      u.progress.status === 'paused'
    );

    if (!nextUpload) {
      return;
    }

    // Remove from queue and add to active
    this.queue = this.queue.filter(u => u.id !== nextUpload.id);
    this.activeUploads.add(nextUpload.id);

    // Start the upload
    this.uploadFile(nextUpload);
  }

  // Upload a single file
  private async uploadFile(uploadFile: UploadFile): Promise<void> {
    const options = this.getUploadOptions(uploadFile);
    
    try {
      uploadFile.progress.status = 'uploading';
      this.updateUpload(uploadFile);

      // Create abort controller
      const abortController = new AbortController();
      this.abortControllers.set(uploadFile.id, abortController);

      // Perform upload
      const response = await this.performUpload(uploadFile, options, abortController);

      if (response.ok) {
        const result = await response.json();
        uploadFile.url = result.url || result.data?.url;
        uploadFile.progress.status = 'completed';
        uploadFile.progress.percentage = 100;
        uploadFile.completedAt = new Date();
        
        this.updateUpload(uploadFile);
        options.onComplete?.(uploadFile);
      } else {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        uploadFile.progress.status = 'cancelled';
      } else {
        uploadFile.progress.status = 'error';
        uploadFile.error = error.message;
        options.onError?.(error.message, uploadFile);
      }
      
      this.updateUpload(uploadFile);
    } finally {
      // Clean up
      this.activeUploads.delete(uploadFile.id);
      this.abortControllers.delete(uploadFile.id);
      
      // Process next in queue
      this.processQueue();
    }
  }

  // Perform the actual upload
  private async performUpload(
    uploadFile: UploadFile, 
    options: UploadOptions,
    abortController: AbortController
  ): Promise<Response> {
    const formData = new FormData();
    formData.append('file', uploadFile.file);

    // Add metadata
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const startTime = Date.now();
    let lastUpdateTime = startTime;
    let lastLoaded = 0;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastUpdateTime) / 1000; // seconds
          const loadedDiff = event.loaded - lastLoaded;
          
          uploadFile.progress.loaded = event.loaded;
          uploadFile.progress.percentage = (event.loaded / event.total) * 100;
          uploadFile.progress.speed = loadedDiff / timeDiff; // bytes per second
          
          if (uploadFile.progress.speed > 0) {
            const remainingBytes = event.total - event.loaded;
            uploadFile.progress.timeRemaining = remainingBytes / uploadFile.progress.speed;
          }

          this.updateUpload(uploadFile);
          options.onProgress?.(uploadFile.progress);

          lastUpdateTime = currentTime;
          lastLoaded = event.loaded;
        }
      });

      // Setup completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          }));
        } else {
          reject(new Error(xhr.statusText));
        }
      });

      // Setup error handling
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new DOMException('Upload aborted', 'AbortError'));
      });

      // Setup abort signal
      abortController.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      // Send request
      xhr.open(options.method || 'POST', `${ENVIRONMENT.API_BASE_URL}${options.endpoint}`);
      
      // Set headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      // Add auth header
      const token = localStorage.getItem('access_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  // Get upload options from stored metadata
  private getUploadOptions(uploadFile: UploadFile): UploadOptions {
    return uploadFile.metadata?.uploadOptions || {
      endpoint: '/upload',
      maxRetries: 3,
      retryDelay: 1000,
    };
  }

  // Update upload in store
  private updateUpload(uploadFile: UploadFile): void {
    this.uploads.set(uploadFile.id, { ...uploadFile });
  }

  // Generate unique ID
  private generateId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Upload management methods
  removeUpload(id: string): void {
    this.cancelUpload(id);
    this.uploads.delete(id);
    this.queue = this.queue.filter(u => u.id !== id);
  }

  pauseUpload(id: string): void {
    const upload = this.uploads.get(id);
    if (upload && upload.progress.status === 'uploading') {
      this.cancelUpload(id);
      upload.progress.status = 'paused';
      this.updateUpload(upload);
      this.queue.push(upload);
    }
  }

  resumeUpload(id: string): void {
    const upload = this.uploads.get(id);
    if (upload && upload.progress.status === 'paused') {
      upload.progress.status = 'pending';
      this.updateUpload(upload);
      this.processQueue();
    }
  }

  cancelUpload(id: string): void {
    const upload = this.uploads.get(id);
    if (upload) {
      // Abort the request
      const controller = this.abortControllers.get(id);
      if (controller) {
        controller.abort();
      }
      
      // Clear retry timeout
      const timeout = this.retryTimeouts.get(id);
      if (timeout) {
        clearTimeout(timeout);
      }
      
      // Update status
      if (upload.progress.status === 'uploading') {
        upload.progress.status = 'cancelled';
        this.updateUpload(upload);
      }
      
      // Remove from active
      this.activeUploads.delete(id);
    }
  }

  retryUpload(id: string): void {
    const upload = this.uploads.get(id);
    if (upload && upload.progress.status === 'error') {
      upload.progress.status = 'pending';
      upload.progress.loaded = 0;
      upload.progress.percentage = 0;
      upload.error = undefined;
      this.updateUpload(upload);
      this.queue.push(upload);
      this.processQueue();
    }
  }

  pauseAll(): void {
    this.paused = true;
    this.activeUploads.forEach(id => {
      this.pauseUpload(id);
    });
  }

  resumeAll(): void {
    this.paused = false;
    this.processQueue();
  }

  cancelAll(): void {
    this.activeUploads.forEach(id => {
      this.cancelUpload(id);
    });
    this.queue = [];
  }

  clearCompleted(): void {
    Array.from(this.uploads.entries())
      .filter(([_, upload]) => upload.progress.status === 'completed')
      .forEach(([id]) => this.uploads.delete(id));
  }

  clearAll(): void {
    this.cancelAll();
    this.uploads.clear();
  }

  // Query methods
  getUpload(id: string): UploadFile | undefined {
    return this.uploads.get(id);
  }

  getUploads(): UploadFile[] {
    return Array.from(this.uploads.values());
  }

  getActiveUploads(): UploadFile[] {
    return Array.from(this.uploads.values())
      .filter(u => u.progress.status === 'uploading');
  }

  getQueuedUploads(): UploadFile[] {
    return Array.from(this.uploads.values())
      .filter(u => u.progress.status === 'pending' || u.progress.status === 'paused');
  }

  getCompletedUploads(): UploadFile[] {
    return Array.from(this.uploads.values())
      .filter(u => u.progress.status === 'completed');
  }

  getTotalProgress(): UploadProgress {
    const uploads = this.getUploads();
    if (uploads.length === 0) {
      return {
        loaded: 0,
        total: 0,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        status: 'pending',
      };
    }

    const total = uploads.reduce((sum, u) => sum + u.progress.total, 0);
    const loaded = uploads.reduce((sum, u) => sum + u.progress.loaded, 0);
    const speed = uploads.reduce((sum, u) => sum + u.progress.speed, 0);

    return {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 0,
      speed,
      timeRemaining: speed > 0 ? (total - loaded) / speed : 0,
      status: this.activeUploads.size > 0 ? 'uploading' : 'completed',
    };
  }
}

// Create singleton instance
export const uploadService = new UploadService();

// Utility functions
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > ENVIRONMENT.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${ENVIRONMENT.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  const isAllowedType = ENVIRONMENT.ALLOWED_FILE_TYPES.some((type: string) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });

  if (!isAllowedType) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else {
    return `${Math.round(seconds / 3600)}h`;
  }
};
