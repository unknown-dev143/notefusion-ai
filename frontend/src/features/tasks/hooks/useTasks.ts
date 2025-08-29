import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService, Task, TaskStatus, TaskPriority } from '../services/taskApiService';

export const useTasks = () => {
  const queryClient = useQueryClient();

  // Get all tasks
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: () => taskApiService.getTasks(),
  });

  // Get tasks by status
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  // Get tasks by priority
  const getTasksByPriority = (priority: TaskPriority) => {
    return tasks.filter(task => task.priority === priority);
  };

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'completed_at'>) => 
      taskApiService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }: { id: string; taskData: Partial<Task> }) => 
      taskApiService.updateTask(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApiService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => 
      taskApiService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Search tasks
  const searchTasks = async (query: string) => {
    return taskApiService.searchTasks(query);
  };

  return {
    // Data
    tasks,
    isLoadingTasks,
    tasksError,
    
    // Filtered tasks
    getTasksByStatus,
    getTasksByPriority,
    
    // Mutations
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    
    // Search
    searchTasks,
    
    // Refetch
    refetchTasks,
  };
};

export default useTasks;
