export type UserRole = 'user' | 'agent' | 'admin';

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
  category?: string;
  sourceUrl?: string;
  originalFilename?: string;
  chunks?: number;
  contentLength?: number;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceLabel?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface Department {
  id?: string;
  name: string;
  duration?: string;
  description?: string;
  head?: string;
  contactEmail?: string;
  website?: string;
  researchAreas?: string[];
  facilities?: string[];
  learningOutcomes?: string[];
  careerPaths?: string[];
  programs?: Array<string | Program>;
}

export interface Program {
  id?: string;
  name: string;
  level?: string;
  duration?: string;
  description?: string;
  requirements?: string[];
  applicationUrl?: string;
  tuitionAmount?: string;
  tuitionCurrency?: string;
  tuitionPeriod?: string;
  registrationFee?: string;
  studyMode?: string;
  intake?: string;
  scholarships?: string[];
}

export interface College {
  name: string;
  description?: string;
  website?: string;
  departments?: Department[];
}

export interface UniversityLink {
  label: string;
  url: string;
  description?: string;
}

export interface UniversityVideo {
  title: string;
  url: string;
  description?: string;
}

export interface UniversityReviewItem {
  id: string;
  universitySlug: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  address?: string;
  admissionsEmail?: string;
  admissionsPhone?: string;
  studentPortal?: string;
  applicationUrl?: string;
  mapUrl?: string;
  academicOverview?: string;
  mission?: string;
  vision?: string;
  accreditation?: string;
  admissionOverview?: string;
  tuitionOverview?: string;
  admissionRequirements?: string[];
  scholarships?: string[];
  applicationDeadlines?: string[];
  studyModes?: string[];
  studentPopulation?: string;
  facultyCount?: string;
  faculties?: string[];
  facilities?: string[];
  campuses?: string[];
  colleges?: College[];
  galleryImages?: string[];
  videos?: UniversityVideo[];
  importantLinks?: UniversityLink[];
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

export type EventCategoryType = 'course' | 'workshop' | 'university_event' | 'seminar' | 'conference' | 'other';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  eventType: EventCategoryType;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  universityId?: string | null;
  universityName?: string;
  eventDate?: string | null;
  location?: string;
  link?: string;
  imageUrl?: string;
  imagePublicId?: string;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventComment {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

