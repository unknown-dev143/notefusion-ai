import { api, handleApiError } from '../../../../src/lib/api';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskBase {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  reminder_enabled: boolean;
  reminder_time?: string | null;
  category?: string | null;
  tags: string[];
}

export interface Task extends TaskBase {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
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
  /**
   * Get all tasks for the authenticated user with optional filtering and pagination
   */
  async getTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    try {
      const response = await api.get<PaginatedResponse<Task>>('/api/v1/tasks', { 
        params: {
          status: params?.status,
          priority: params?.priority,
          q: params?.search,
          page: params?.page,
          limit: params?.limit,
        } 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch tasks');
    }
  },

  /**
   * Get a single task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await api.get<Task>(`/api/v1/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch task ${id}`);
    }
  },

  /**
   * Create a new task
   */
  async createTask(taskData: TaskCreate): Promise<Task> {
    try {
      // Ensure required fields are present
      const taskToCreate: TaskCreate = {
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        reminder_enabled: taskData.reminder_enabled || false,
        reminder_time: taskData.reminder_time || null,
        category: taskData.category || null,
        tags: taskData.tags || [],
      };

      const response = await api.post<Task>('/api/v1/tasks', taskToCreate);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create task');
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, taskData: TaskUpdate): Promise<Task> {
    try {
      const response = await api.put<Task>(`/api/v1/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update task ${id}`);
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/tasks/${id}`);
    } catch (error) {
      throw handleApiError(error, `Failed to delete task ${id}`);
    }
  },

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const response = await api.patch<Task>(`/api/v1/tasks/${id}/status/${status}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update task ${id} status`);
    }
  },

  /**
   * Search tasks by title or description
   */
  async searchTasks(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Task>> {
    try {
      const response = await api.get<PaginatedResponse<Task>>('/api/v1/tasks/search', { 
        params: { 
          q: query,
          page,
          limit,
        } 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to search tasks');
    }
  },

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: TaskStatus, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Task>> {
    try {
      const response = await this.getTasks({ status, page, limit });
      return response;
    } catch (error) {
      throw handleApiError(error, `Failed to get tasks with status ${status}`);
    }
  },

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(priority: TaskPriority, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Task>> {
    try {
      const response = await this.getTasks({ priority, page, limit });
      return response;
    } catch (error) {
      throw handleApiError(error, `Failed to get tasks with priority ${priority}`);
    }
  },

  /**
   * Get tasks due today
   */
  async getTasksDueToday(page: number = 1, limit: number = 50): Promise<PaginatedResponse<Task>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.getTasks({ 
        due_date: today,
        page,
        limit,
      });
      return response;
    } catch (error) {
      throw handleApiError(error, 'Failed to get tasks due today');
    }
  },

  /**
   * Get upcoming tasks (due in the next 7 days)
   */
  async getUpcomingTasks(page: number = 1, limit: number = 50): Promise<PaginatedResponse<Task>> {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      // This would require a date range filter in the backend
      // For now, we'll just get all tasks and filter client-side
      const response = await this.getTasks({ page, limit });
      
      // Client-side filtering (not ideal, but works for now)
      const upcomingTasks = response.items.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate > today && dueDate <= nextWeek;
      });
      
      return {
        ...response,
        items: upcomingTasks,
        total: upcomingTasks.length,
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to get upcoming tasks');
    }
  },
};

export default taskApiService;
