import { api, handleApiError } from '../../../lib/api';


export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'pending' | 'completed' | 'cancelled' | 'in_progress';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskBase {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  tags: string[];
  reminder_enabled?: boolean;
  reminder_time?: string | null;
  category?: string | null;
  user_id?: string;
  completed_at?: string | null;
}

export interface Task extends TaskBase {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate extends Omit<TaskBase, 'status'> {
  status?: TaskStatus;
}

export interface TaskUpdate extends Partial<TaskBase> {}

// Response types for pagination and filtering
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface TaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page?: number;
  limit?: number;
}

export const taskApiService = {
  async getTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Task[]> {
    try {
      const response = await api.get<Task[]>('/tasks', { 
        params: {
          skip: (params?.page && params?.limit) ? (params.page - 1) * params.limit : 0,
          limit: params?.limit || 100,
        } 
      });
      // Client-side filtering if needed, or backend updates to support filters
      let tasks = response.data;
      if (params?.status) tasks = tasks.filter(t => t.status === params.status);
      if (params?.priority) tasks = tasks.filter(t => t.priority === params.priority);
      return tasks;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch tasks');
    }
  },

  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await api.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch task ${id}`);
    }
  },

  async createTask(taskData: TaskCreate): Promise<Task> {
    try {
      const taskToCreate = {
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        tags: taskData.tags || [],
      };
      const response = await api.post<Task>('/tasks', taskToCreate);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create task');
    }
  },

  async updateTask(id: string, taskData: TaskUpdate): Promise<Task> {
    try {
      const response = await api.patch<Task>(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update task ${id}`);
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      throw handleApiError(error, `Failed to delete task ${id}`);
    }
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const response = await api.patch<Task>(`/tasks/${id}`, { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update task ${id} status`);
    }
  },

  async searchTasks(query: string): Promise<Task[]> {
    try {
      const response = await api.get<Task[]>('/tasks', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to search tasks');
    }
  },
};

export default taskApiService;
