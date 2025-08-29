import { useState, useCallback } from 'react';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  loading: boolean;
}

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: any = null,
    headers: Record<string, string> = {},
  ): Promise<{ data: T | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include',
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(<T = any>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, 'GET', undefined, headers)
  , [request]);

  const post = useCallback(<T = any>(endpoint: string, body: any, headers?: Record<string, string>) => 
    request<T>(endpoint, 'POST', body, headers)
  , [request]);

  const put = useCallback(<T = any>(endpoint: string, body: any, headers?: Record<string, string>) => 
    request<T>(endpoint, 'PUT', body, headers)
  , [request]);

  const del = useCallback(<T = any>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, 'DELETE', undefined, headers)
  , [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi;
