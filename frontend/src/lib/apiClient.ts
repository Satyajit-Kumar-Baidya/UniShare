/// <reference types="vite/client" />
/**
 * Core API Client
 *
 * Handles request normalization, JWT authentication, and error standardization.
 */

// Uses proxy during local development, falls back to env variable for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestConfig extends RequestInit {
  data?: any;
}

export async function apiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: RequestConfig = {}
): Promise<T> {
const token = localStorage.getItem('unishare_access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge custom headers if provided
  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers,
    ...customConfig,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Unauthorized API call. Token might be expired.');
      // window.dispatchEvent(new Event('auth-unauthorized'));
    }

    let errorMessage = response.statusText;
    try {
      const errData = await response.json();
      errorMessage = errData.detail || errData.message || JSON.stringify(errData);
    } catch {
      // Ignore if json parsing fails
    }

    throw new Error(errorMessage);
  }

  // Return parsed JSON if content-length > 0 or 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}