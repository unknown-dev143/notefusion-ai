import { message } from 'antd';

type ApiError = {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
  message: string;
};

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred'): void => {
  const apiError = error as ApiError;
  let errorMessage = defaultMessage;
  
  if (apiError.response) {
    const { data } = apiError.response;
    
    if (data?.message) {
      errorMessage = data.message;
    } else if (data?.error) {
      errorMessage = data.error;
    } else if (data?.errors) {
      // Handle validation errors
      const errorMessages = Object.values(data.errors).flat();
      errorMessage = errorMessages.join('\n');
    } else if (apiError.response.status === 401) {
      errorMessage = 'Please log in to continue';
      // Optionally redirect to login
      // history.push('/login');
    } else if (apiError.response.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (apiError.response.status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (apiError.response.status >= 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }
  } else if (apiError.message) {
    errorMessage = apiError.message;
  }
  
  console.error('API Error:', error);
  message.error(errorMessage);
};

export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
  }
): Promise<T | undefined> => {
  try {
    const data = await apiCall();
    if (options?.successMessage) {
      message.success(options.successMessage);
    }
    if (options?.onSuccess) {
      options.onSuccess(data);
    }
    return data;
  } catch (error) {
    handleApiError(error, options?.errorMessage);
    if (options?.onError) {
      options.onError(error);
    }
    return undefined;
  }
};
