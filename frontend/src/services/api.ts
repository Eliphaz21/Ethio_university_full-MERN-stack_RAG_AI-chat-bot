/**
 * Frontend API client for EthioUni backend.
 * Authentication uses httpOnly cookies — tokens are never stored in localStorage.
 */

import axios, { AxiosRequestConfig } from 'axios';
import type { AuditLog, User, University, EventItem, EventComment } from '../types';

const CSRF_COOKIE = 'ethiouni_csrf';
const CSRF_HEADER = 'x-csrf-token';

const getBaseUrl = () => {
  const configured = String((import.meta as any).env?.VITE_API_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '').replace(/\/api$/i, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5001';
};

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isMutating) {
      const csrfToken = getCsrfToken();
      if (csrfToken) headers[CSRF_HEADER] = csrfToken;
    }

    const config: AxiosRequestConfig = {
      url: path,
      method: method as any,
      data,
      headers,
      withCredentials: true,
    };

    const response = await apiClient.request(config);
    return response.data;
  } catch (error: any) {
    if (requireAuth && error.response?.status === 401) {
      throw new Error(error.response?.data?.error || 'Authentication required');
    }
    const message = error.response?.data?.error || error.message || 'Request failed';
    throw new Error(message);
  }
}

function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const csrfToken = getCsrfToken();
  return axios
    .post<T>(`${getBaseUrl()}${path}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(csrfToken ? { [CSRF_HEADER]: csrfToken } : {}),
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      const message = error.response?.data?.error || error.message || 'Upload failed';
      throw new Error(message);
    });
}

export const api = {
  postRegister: (body: { username: string; email: string; password: string }) =>
    request<{ message: string }>('/api/auth/register', {
      method: 'POST',
      data: body,
    }),

  postLogin: (body: { email: string; password: string }) =>
    request<{ user: any }>('/api/auth/login', { method: 'POST', data: body }),

  postLogout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  getSession: () =>
    request<{ user: any }>('/api/auth/session', { method: 'GET', requireAuth: true }),

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

  uploadAvatar: (formData: FormData) =>
    uploadRequest<{ message: string; avatarUrl: string }>('/api/auth/upload-avatar', formData),

  postChat: (body: { prompt: string }) =>
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

  postAdminKnowledge: (body: { title: string; content: string; type: string; category?: string }) =>
    request<{ message: string; id: string; title: string; chunks: number; contentLength: number }>('/api/admin/knowledge', {
      method: 'POST',
      data: body,
      requireAuth: true,
    }),

  uploadAdminKnowledgePDF: (formData: FormData) =>
    uploadRequest('/api/admin/knowledge/pdf', formData),

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
    const formData = new FormData();
    formData.append('image', file);
    return uploadRequest<{ message: string; image: string; university: University }>(
      `/api/admin/universities/${id}/image`,
      formData
    );
  },

  uploadUniversityGalleryImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return uploadRequest<{ message: string; images: string[]; university: University }>(
      `/api/admin/universities/${id}/gallery`,
      formData
    );
  },

  // Hub & Events APIs
  getEvents: (params: { eventType?: string; universityId?: string; search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.eventType && params.eventType !== 'all') query.append('eventType', params.eventType);
    if (params.universityId && params.universityId !== 'all') query.append('universityId', params.universityId);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ events: EventItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/events${queryString}`,
      { method: 'GET' }
    );
  },

  getEventById: (id: string) =>
    request<{ event: EventItem }>(`/api/events/${id}`, { method: 'GET' }),

  createEvent: (formData: FormData) =>
    uploadRequest<{ message: string; event: EventItem }>('/api/events', formData),

  deleteEvent: (id: string) =>
    request<{ message: string }>(`/api/events/${id}`, { method: 'DELETE', requireAuth: true }),

  toggleLikeEvent: (id: string) =>
    request<{ likesCount: number; isLiked: boolean }>(`/api/events/${id}/like`, { method: 'POST', requireAuth: true }),

  getEventComments: (id: string) =>
    request<{ comments: EventComment[] }>(`/api/events/${id}/comments`, { method: 'GET' }),

  createEventComment: (id: string, content: string) =>
    request<{ message: string; comment: EventComment }>(`/api/events/${id}/comments`, {
      method: 'POST',
      data: { content },
      requireAuth: true,
    }),

  deleteEventComment: (id: string, commentId: string) =>
    request<{ message: string }>(`/api/events/${id}/comments/${commentId}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

