export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  institution?: string;
  department?: string;
  bio?: string;
  academicTitle?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  type: string;
  uploadedAt: string;
}

export interface Department {
  id?: string;
  name: string;
  duration?: string;
  description?: string;
  head?: string;
  programs?: string[];
}

export interface Program {
  id?: string;
  name: string;
  duration: string;
  description?: string;
  requirements?: string[];
}

export interface College {
  name: string;
  departments?: Department[];
}

export interface University {
  id: string;
  name: string;
  description: string;
  website: string;
  location: {
    city: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  established?: number;
  type?: 'Public' | 'Private';
  slug?: string;
  contactEmail?: string;
  contactPhone?: string;
  phone?: string;
  faculties?: string[];
  facilities?: string[];
  campuses?: string[];
  colleges?: College[];
  coordinates?: { lat: number; lng: number };
  image?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId: string;
  messages: ChatMessage[];
  lastUpdated: string;
}
