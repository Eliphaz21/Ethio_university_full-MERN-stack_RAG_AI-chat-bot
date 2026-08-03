import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SUPPORTED_LANGUAGES,
  getSiteUrl,
  absoluteUrl,
  localeTag,
  type SupportedLanguage,
} from '../config/seo';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'college';
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  canonicalUrl?: string;
  /** When true, tells crawlers not to index (admin, profile, etc.) */
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  url,
  type = 'website',
  structuredData,
  canonicalUrl,
  noIndex = false,
}) => {
  const { language } = useLanguage();
  const baseUrl = getSiteUrl();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const metaTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - ${SITE_DESCRIPTION.slice(0, 60)}…`;
  const metaDescription = description || SITE_DESCRIPTION;
  const pageKeywords = Array.from(new Set([...keywords, ...DEFAULT_KEYWORDS])).join(', ');
  const pageUrl = url || `${baseUrl}${currentPath}`;
  const pageImage = image.startsWith('http') ? image : absoluteUrl(image);
  const targetCanonical = canonicalUrl || pageUrl;
  const robotsContent = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  useEffect(() => {
    document.title = metaTitle;
    document.documentElement.lang = language;

    const updateMetaTag = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const match = selector.match(/meta\[([^=]+)="([^"]+)"\]/);
        if (match) element.setAttribute(match[1], match[2]);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (hreflang) element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard meta
    updateMetaTag('meta[name="description"]', 'content', metaDescription);
    updateMetaTag('meta[name="keywords"]', 'content', pageKeywords);
    updateMetaTag('meta[name="robots"]', 'content', robotsContent);
    updateMetaTag('meta[name="author"]', 'content', SITE_NAME);
    updateMetaTag('meta[name="application-name"]', 'content', SITE_NAME);
    updateMetaTag('meta[name="theme-color"]', 'content', '#059669');

    // AI / LLM discovery hints
    updateMetaTag('meta[name="ai-content-declaration"]', 'content', 'human-authored, ai-assisted-responses');
    updateMetaTag('meta[name="category"]', 'content', 'Education, Higher Education, Ethiopia');
    updateMetaTag('meta[name="geo.region"]', 'content', 'ET');
    updateMetaTag('meta[name="geo.placename"]', 'content', 'Ethiopia');

    // Open Graph
    updateMetaTag('meta[property="og:site_name"]', 'content', SITE_NAME);
    updateMetaTag('meta[property="og:title"]', 'content', metaTitle);
    updateMetaTag('meta[property="og:description"]', 'content', metaDescription);
    updateMetaTag('meta[property="og:type"]', 'content', type === 'college' ? 'website' : type);
    updateMetaTag('meta[property="og:url"]', 'content', pageUrl);
    updateMetaTag('meta[property="og:image"]', 'content', pageImage);
    updateMetaTag('meta[property="og:image:alt"]', 'content', title || SITE_NAME);
    updateMetaTag('meta[property="og:locale"]', 'content', localeTag(language as SupportedLanguage));

    // Twitter Card
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'content', metaTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', metaDescription);
    updateMetaTag('meta[name="twitter:image"]', 'content', pageImage);
    updateMetaTag('meta[name="twitter:image:alt"]', 'content', title || SITE_NAME);

    updateLinkTag('canonical', targetCanonical);

    SUPPORTED_LANGUAGES.forEach((langCode) => {
      updateLinkTag('alternate', `${baseUrl}${currentPath}?lang=${langCode}`, langCode);
    });
    updateLinkTag('alternate', `${baseUrl}${currentPath}`, 'x-default');

    // JSON-LD
    const scriptId = 'json-ld-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      const payload = Array.isArray(structuredData) ? structuredData : [structuredData];
      scriptElement.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [
    metaTitle,
    metaDescription,
    pageKeywords,
    pageUrl,
    pageImage,
    type,
    language,
    structuredData,
    targetCanonical,
    baseUrl,
    currentPath,
    robotsContent,
    title,
  ]);

  return null;
};

/** Schema.org EducationalOrganization for a university profile page */
export function buildUniversitySchema(university: any, localizedName?: string, localizedDesc?: string) {
  const baseUrl = getSiteUrl();
  const name = localizedName || university.name;
  const description = localizedDesc || university.description;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name,
    description,
    url: `${baseUrl}/university/${university.slug}`,
    sameAs: university.website ? [university.website] : undefined,
    logo: university.image || absoluteUrl(DEFAULT_OG_IMAGE),
    image: university.image || absoluteUrl(DEFAULT_OG_IMAGE),
    address: {
      '@type': 'PostalAddress',
      streetAddress: university.address || undefined,
      addressLocality: university.location?.city || 'Addis Ababa',
      addressRegion: university.location?.region || 'Ethiopia',
      addressCountry: 'ET',
    },
    ...(university.location?.coordinates?.lat && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: university.location.coordinates.lat,
        longitude: university.location.coordinates.lng,
      },
    }),
    foundingDate: university.established ? String(university.established) : undefined,
    email: university.contactEmail || undefined,
    telephone: university.phone || university.contactPhone || undefined,
  };
}

/** Schema.org WebSite with sitelinks search box */
export function buildWebSiteSchema() {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: baseUrl,
    description: SITE_DESCRIPTION,
    inLanguage: ['en', 'am', 'om', 'ti', 'so'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/universities?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Schema.org Organization for the portal brand */
export function buildOrganizationSchema() {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: baseUrl,
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    description: SITE_DESCRIPTION,
    areaServed: {
      '@type': 'Country',
      name: 'Ethiopia',
    },
    knowsAbout: [
      'Ethiopian higher education',
      'University admissions',
      'Grade 12 ESSLCE',
      'MoGE cutoff scores',
    ],
  };
}

/** Schema.org SoftwareApplication for the AI assistant */
export function buildAIAssistantSchema() {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EthioUni AI Assistant',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: baseUrl,
    description:
      'Multilingual RAG-powered chatbot that answers questions about Ethiopian universities, admissions, programs, and remedial pathways using verified knowledge base content.',
    inLanguage: ['en', 'am', 'om', 'ti', 'so'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'ETB',
    },
  };
}

/** Schema.org BreadcrumbList for navigation context */
export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

/** Schema.org ItemList for university directory pages */
export function buildUniversityListSchema(universities: Array<{ name: string; slug: string; description?: string }>) {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ethiopian Universities Directory',
    description: 'Accredited public and private universities in Ethiopia',
    numberOfItems: universities.length,
    itemListElement: universities.slice(0, 50).map((uni, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/university/${uni.slug}`,
      name: uni.name,
      description: uni.description,
    })),
  };
}
