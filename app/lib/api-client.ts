import { API_CONFIG } from '@/app/config/api.config';
import type { ApiError } from '@/app/types/train.types';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.message || `HTTP Error: ${response.status}`,
        status: response.status,
        code: errorData.code,
      };
      throw error;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: ApiError = {
        message: 'Request timed out. Please try again.',
        status: 408,
        code: 'TIMEOUT',
      };
      throw timeoutError;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError: ApiError = {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
      throw networkError;
    }

    throw error;
  }
}

