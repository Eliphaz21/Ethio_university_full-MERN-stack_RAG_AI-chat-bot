import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'college';
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  canonicalUrl?: string;
}

const DEFAULT_KEYWORDS = [
  'Ethiopian Universities',
  'Higher Education Ethiopia',
  'Addis Ababa University',
  'ASTU Adama',
  'Ethiopia University Directory',
  'MoGE Cutoff Scores',
  'Grade 12 ESSLCE Admissions',
  'Ethiopian AI Chatbot',
  'Remedial Program Ethiopia',
  'አማርኛ',
  'Afaan Oromoo',
  'ትግርኛ',
  'Af-Somali'
];

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image = '/assets/logo.png',
  url,
  type = 'website',
  structuredData,
  canonicalUrl
}) => {
  const { language } = useLanguage();
  const siteName = 'EthioUni Portal';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ethiouni.portal.et';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const metaTitle = title ? `${title} | ${siteName}` : `${siteName} - Ethiopian University Directory & AI Assistant`;
  const metaDescription = description || 'Discover accredited Ethiopian universities, Grade 12 ESSLCE admission criteria, degree programs, and chat with our RAG AI assistant in Amharic, Oromo, Tigrinya, Somali, or English.';
  const pageKeywords = Array.from(new Set([...keywords, ...DEFAULT_KEYWORDS])).join(', ');
  const pageUrl = url || `${baseUrl}${currentPath}`;
  const pageImage = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const targetCanonical = canonicalUrl || pageUrl;

  useEffect(() => {
    // Update Title & HTML attributes
    document.title = metaTitle;
    document.documentElement.lang = language;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        element.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Helper to update link tags
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

    // Standard Meta
    updateMetaTag('meta[name="description"]', 'content', metaDescription);
    updateMetaTag('meta[name="keywords"]', 'content', pageKeywords);
    updateMetaTag('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large');
    updateMetaTag('meta[name="author"]', 'content', 'EthioUni Portal');

    // Open Graph / Facebook
    updateMetaTag('meta[property="og:site_name"]', 'content', siteName);
    updateMetaTag('meta[property="og:title"]', 'content', metaTitle);
    updateMetaTag('meta[property="og:description"]', 'content', metaDescription);
    updateMetaTag('meta[property="og:type"]', 'content', type === 'college' ? 'website' : type);
    updateMetaTag('meta[property="og:url"]', 'content', pageUrl);
    updateMetaTag('meta[property="og:image"]', 'content', pageImage);
    updateMetaTag('meta[property="og:locale"]', 'content', language === 'am' ? 'am_ET' : language === 'om' ? 'om_ET' : language === 'ti' ? 'ti_ET' : language === 'so' ? 'so_ET' : 'en_US');

    // Twitter Card
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'content', metaTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', metaDescription);
    updateMetaTag('meta[name="twitter:image"]', 'content', pageImage);

    // Canonical link
    updateLinkTag('canonical', targetCanonical);

    // Multi-lingual hreflang links
    ['en', 'am', 'om', 'ti', 'so'].forEach((langCode) => {
      updateLinkTag('alternate', `${baseUrl}${currentPath}?lang=${langCode}`, langCode);
    });
    updateLinkTag('alternate', `${baseUrl}${currentPath}`, 'x-default');

    // JSON-LD Structured Data
    const scriptId = 'json-ld-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [metaTitle, metaDescription, pageKeywords, pageUrl, pageImage, type, language, structuredData, targetCanonical, baseUrl, currentPath]);

  return null;
};

/** Generate Schema.org JSON-LD for EducationalOrganization / College */
export function buildUniversitySchema(university: any, localizedName?: string, localizedDesc?: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ethiouni.portal.et';
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': localizedName || university.name,
    'description': localizedDesc || university.description,
    'url': `${baseUrl}/university/${university.slug}`,
    'sameAs': university.website ? [university.website] : [],
    'logo': university.image || `${baseUrl}/assets/logo.png`,
    'image': university.image || `${baseUrl}/assets/logo.png`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': university.location?.city || 'Addis Ababa',
      'addressRegion': university.location?.region || 'Ethiopia',
      'addressCountry': 'ET'
    },
    ...(university.location?.coordinates?.lat && {
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': university.location.coordinates.lat,
        'longitude': university.location.coordinates.lng
      }
    }),
    'foundingDate': university.established ? String(university.established) : undefined
  };
}

/** Generate Schema.org JSON-LD for Portal Website */
export function buildWebSiteSchema() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ethiouni.portal.et';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'EthioUni Portal',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/universities?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}
