/**
 * Central SEO & AI-discovery configuration for EthioUni Portal.
 * Set VITE_SITE_URL in production (e.g. https://ethiouni.portal.et).
 */

export const SITE_NAME = 'EthioUni Portal';

export const SITE_TAGLINE = 'Ethiopian University Directory & AI Assistant';

export const SITE_DESCRIPTION =
  'Discover accredited Ethiopian universities, Grade 12 ESSLCE admission criteria, degree programs, tuition, and chat with our multilingual RAG AI assistant in Amharic, Oromo, Tigrinya, Somali, or English.';

export const DEFAULT_KEYWORDS = [
  'Ethiopian Universities',
  'Higher Education Ethiopia',
  'Addis Ababa University',
  'ASTU Adama',
  'Ethiopia University Directory',
  'MoGE Cutoff Scores',
  'Grade 12 ESSLCE Admissions',
  'Ethiopian AI Chatbot',
  'University Admission Ethiopia',
  'Remedial Program Ethiopia',
  'አማርኛ',
  'Afaan Oromoo',
  'ትግርኛ',
  'Af-Somali',
];

export const DEFAULT_OG_IMAGE = '/assets/logo.png';

export const SUPPORTED_LANGUAGES = ['en', 'am', 'om', 'ti', 'so'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Resolve canonical site origin (no trailing slash). */
export function getSiteUrl(): string {
  const configured = String((import.meta as any).env?.VITE_SITE_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://ethiouni.portal.et';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function localeTag(language: SupportedLanguage): string {
  const map: Record<SupportedLanguage, string> = {
    en: 'en_US',
    am: 'am_ET',
    om: 'om_ET',
    ti: 'ti_ET',
    so: 'so_ET',
  };
  return map[language] || 'en_US';
}
