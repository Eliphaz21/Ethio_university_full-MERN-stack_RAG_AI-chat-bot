/**
 * Frontend API client for EthioUni backend.
 * All auth-protected requests use the token from localStorage (set on login).
 */

import axios, { AxiosRequestConfig } from 'axios';
import type { AuditLog, User, University } from '../types';

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
    request<{ token: string; user: any }>('/api/auth/login', { method: 'POST', data: body }),

  getProfile: () => request<{ user: any }>('/api/auth/profile', { method: 'GET', requireAuth: true }),

  updateProfile: (body: {
    username?: string;
    phone?: string;
    institution?: string;
    department?: string;
    bio?: string;
    academicTitle?: string;
    avatarUrl?: string;
  }) =>
    request<{ message: string; user: any }>('/api/auth/profile', {
      method: 'PUT',
      data: body,
      requireAuth: true,
    }),

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
  postAdminKnowledge: (body: { title: string; content: string; type: string; category?: string }) =>
    request<{ message: string; id: string; title: string; chunks: number; contentLength: number }>('/api/admin/knowledge', {
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

  postAdminKnowledgeUrl: (body: { url: string; title?: string; category?: string }) =>
    request<{ message: string; id: string; title?: string; chunks: number; contentLength: number }>('/api/admin/knowledge/url', {
      method: 'POST',
      data: body,
      requireAuth: true,
    }),

  getKnowledge: () =>
    request<import('../types').KnowledgeDoc[]>('/api/admin/knowledge', {
      method: 'GET',
      requireAuth: true,
    }),

  getKnowledgeDocument: (id: string) =>
    request<import('../types').KnowledgeDoc>(`/api/admin/knowledge/${id}`, {
      method: 'GET',
      requireAuth: true,
    }),

  updateKnowledgeDocument: (id: string, body: { title: string; category: string }) =>
    request<{ message: string; updatedChunks: number }>(`/api/admin/knowledge/${id}`, {
      method: 'PUT',
      data: body,
      requireAuth: true,
    }),

  deleteKnowledge: (id: string) =>
    request<{ message: string }>(`/api/admin/knowledge/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  getUsers: () =>
    request<User[]>('/api/admin/users', {
      method: 'GET',
      requireAuth: true,
    }),

  getUser: (id: string) =>
    request<User>(`/api/admin/users/${id}`, { method: 'GET', requireAuth: true }),

  createUser: (data: Omit<User, 'id' | 'createdAt'> & { password?: string }) =>
    request<{ message: string; user: User; temporaryPassword?: string }>('/api/admin/users', {
      method: 'POST',
      data,
      requireAuth: true,
    }),

  updateUser: (id: string, data: Partial<User> & { password?: string }) =>
    request<{ message: string; user: User }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      data,
      requireAuth: true,
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  getAuditLogs: (params: { page?: number; limit?: number; search?: string; resourceType?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<{ items: AuditLog[]; total: number; page: number; pages: number }>(`/api/admin/audit-logs${suffix}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  getUniversities: () =>
    request<University[]>('/api/universities', {
      method: 'GET',
    }),

  getUniversityBySlug: (slug: string) =>
    request<University>(`/api/universities/${slug}`, {
      method: 'GET',
    }),

  getAdminUniversityById: (id: string) =>
    request<University>(`/api/admin/universities/${id}`, {
      method: 'GET',
      requireAuth: true,
    }),

  createUniversity: (data: Omit<University, 'id'> | Partial<University>) =>
    request<{ message: string; university: University }>('/api/admin/universities', {
      method: 'POST',
      data,
      requireAuth: true,
    }),

  updateUniversity: (id: string, data: Partial<University>) =>
    request<{ message: string; university: University }>(`/api/admin/universities/${id}`, {
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
    return axios.post<{ message: string; image: string; university: University }>(`${getBaseUrl()}/api/admin/universities/${id}/image`, formData, {
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

  uploadUniversityGalleryImages: (id: string, files: File[]) => {
    const token = getToken();
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return axios.post<{ message: string; images: string[]; university: University }>(
      `${getBaseUrl()}/api/admin/universities/${id}/gallery`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    )
      .then((response) => response.data)
      .catch((error) => {
        const message = error.response?.data?.error || error.message || 'Gallery upload failed';
        throw new Error(message);
      });
  },
};
