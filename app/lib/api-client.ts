import { API_CONFIG } from '@/app/config/api.config';
import type { ApiError } from '@/app/types/train.types';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

function createApiError(message: string, status: number, code?: string): ApiError {
  return { message, status, code };
}

export async function apiClient<T>(url: string, options: FetchOptions = {}): Promise<T> {
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
      throw createApiError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw createApiError('Request timed out. Please try again.', 408, 'TIMEOUT');
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw createApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
    }

    throw error;
  }
}

