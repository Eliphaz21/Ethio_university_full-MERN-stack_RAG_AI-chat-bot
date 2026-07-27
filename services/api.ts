/**
 * Frontend API client for EthioUni backend.
 * All auth-protected requests use the token from localStorage (set on login).
 */

import axios, { AxiosRequestConfig } from 'axios';

const getBaseUrl = () => (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001';

const getToken = (): string | null => localStorage.getItem('token');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// We set auth headers per-request below instead of using a custom axios property

export interface ApiError {
  error: string;
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    data?: any;
    requireAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', data, requireAuth = false } = options;

  try {
    const token = getToken();
    const config: AxiosRequestConfig = {
      url: path,
      method: method as any,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (requireAuth && token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    const response = await apiClient.request(config);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Request failed';
    throw new Error(message);
  }
}

// Auth (no token required)
export const api = {
  postRegister: (body: { username: string; email: string; password: string }) =>
    request<{ message: string; token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      data: body,
    }),

  postLogin: (body: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; username: string; email: string; role: string } }>(
      '/api/auth/login',
      { method: 'POST', data: body }
    ),

  postChat: (body: { prompt: string; userId?: string }) =>
    request<{ text: string }>('/api/chat', {
      method: 'POST',
      data: body,
      requireAuth: true,
    }),

  getChatHistory: () =>
    request<{ messages: any[] }>('/api/chat/history', {
      method: 'GET',
      requireAuth: true,
    }),

  clearChatHistory: () =>
    request<{ message: string }>('/api/chat/history', {
      method: 'DELETE',
      requireAuth: true,
    }),

  // Admin routes
  postAdminKnowledge: (body: { title: string; content: string; type: string }) =>
    request<{ message: string; id: string }>('/api/admin/knowledge', {
      method: 'POST',
      data: body,
      requireAuth: true,
    }),

  uploadAdminKnowledgePDF: (formData: FormData) => {
    const token = getToken();
    return axios.post(`${getBaseUrl()}/api/admin/knowledge/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }).then((res) => res.data);
  },

  postAdminKnowledgeUrl: (body: { url: string; title?: string }) =>
    request<{ message: string; id: string; title?: string }>('/api/admin/knowledge/url', {
      method: 'POST',
      data: body,
      requireAuth: true,
    }),

  getKnowledge: () =>
    request<Array<{ id: string; title: string; content: string; type: string; uploadedAt: string }>>('/api/admin/knowledge', {
      method: 'GET',
      requireAuth: true,
    }),

  deleteKnowledge: (id: string) =>
    request<{ message: string }>(`/api/admin/knowledge/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  getUsers: () =>
    request<Array<{ id: string; username: string; email: string; role: string }>>('/api/admin/users', {
      method: 'GET',
      requireAuth: true,
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  getUniversities: () =>
    request<Array<any>>('/api/universities', {
      method: 'GET',
    }),

  getUniversityBySlug: (slug: string) =>
    request<any>(`/api/universities/${slug}`, {
      method: 'GET',
    }),

  createUniversity: (data: any) =>
    request<{ message: string; university: any }>('/api/admin/universities', {
      method: 'POST',
      data,
      requireAuth: true,
    }),

  updateUniversity: (id: string, data: any) =>
    request<{ message: string; university: any }>(`/api/admin/universities/${id}`, {
      method: 'PUT',
      data,
      requireAuth: true,
    }),

  deleteUniversity: (id: string) =>
    request<{ message: string }>(`/api/admin/universities/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  uploadUniversityImage: (id: string, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${getBaseUrl()}/api/admin/universities/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.data)
      .catch((error) => {
        const message = error.response?.data?.error || error.message || 'Image upload failed';
        throw new Error(message);
      });
  },
};

