/**
 * Utility functions for optimizing image URLs (Cloudinary auto-format/quality/resizing)
 * to deliver ultra-fast page load times and responsive image delivery.
 */

export const DEFAULT_UNIVERSITY_IMAGE = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';

export function getOptimizedImageUrl(
  src?: string | null,
  widthOrOptions: number | { width?: number; height?: number; crop?: string; quality?: string } = 800
): string {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return DEFAULT_UNIVERSITY_IMAGE;
  }

  const trimmed = src.trim();
  const width = typeof widthOrOptions === 'number' ? widthOrOptions : (widthOrOptions.width || 800);
  const quality = typeof widthOrOptions === 'object' ? (widthOrOptions.quality || '80') : '80';

  // Cloudinary URL Optimization
  if (trimmed.includes('res.cloudinary.com')) {
    // Check if URL already has transformations or needs upload path injection
    if (trimmed.includes('/upload/')) {
      const parts = trimmed.split('/upload/');
      // Avoid duplicating transformations if already present
      if (parts[1].startsWith('f_auto') || parts[1].startsWith('w_') || parts[1].startsWith('c_')) {
        return trimmed;
      }
      const transform = `f_auto,q_auto,w_${width},c_limit`;
      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
  }

  // Unsplash URL Optimization
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const url = new URL(trimmed);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', quality);
      return url.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
