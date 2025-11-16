<<<<<<< HEAD
import React, { useState, useCallback } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  onUploadComplete: (result: any) => void;
  acceptedTypes: string;
  endpoint: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  acceptedTypes,
  endpoint,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadComplete(response.data);
    } catch (err) {
      setError('Upload failed: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  }, [endpoint, onUploadComplete]);

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer flex flex-col items-center justify-center space-y-2 
          ${isUploading ? 'opacity-50' : 'hover:bg-gray-50'}`}
      >
        <div className="text-sm text-gray-600">
          {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
        </div>
        <div className="text-xs text-gray-500">
          {acceptedTypes.split(',').join(', ')} files
        </div>
      </label>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
=======
import React, { useState, useCallback } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  onUploadComplete: (result: any) => void;
  acceptedTypes: string;
  endpoint: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  acceptedTypes,
  endpoint,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadComplete(response.data);
    } catch (err) {
      setError('Upload failed: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  }, [endpoint, onUploadComplete]);

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer flex flex-col items-center justify-center space-y-2 
          ${isUploading ? 'opacity-50' : 'hover:bg-gray-50'}`}
      >
        <div className="text-sm text-gray-600">
          {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
        </div>
        <div className="text-xs text-gray-500">
          {acceptedTypes.split(',').join(', ')} files
        </div>
      </label>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
