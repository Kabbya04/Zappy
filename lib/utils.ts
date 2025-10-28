// /lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Properly formats image URLs from various APIs
 * @param imageUrl The image URL returned from the API
 * @returns A properly formatted image URL or null if invalid
 */
export function formatImageUrl(imageUrl: string | undefined): string | null {
  if (!imageUrl) return null;
  
  const trimmedUrl = imageUrl.trim();

  // If it's already a valid, absolute URL, return it directly.
  if (trimmedUrl.startsWith('http')) {
    try {
      // Use the URL constructor to validate
      new URL(trimmedUrl);
      return trimmedUrl;
    } catch (e) {
      // If it's a malformed URL, fall through to the logic below
      console.warn(`Malformed URL detected: ${trimmedUrl}`);
    }
  }
  
  // Handle TVDB's relative paths
  if (trimmedUrl.includes('banners/') || trimmedUrl.includes('artworks/')) {
    const path = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `https://artworks.thetvdb.com${path}`;
  }
  
  // Handle RAWG's relative paths (if they ever occur)
  if (trimmedUrl.startsWith('/media/')) {
    return `https://media.rawg.io/media${trimmedUrl}`;
  }
  
  // Fallback for any other root-relative paths.
  if (trimmedUrl.startsWith('/')) {
    // This is a simple fallback and might not cover all cases.
    // It assumes the path is relative to the current host.
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}${trimmedUrl}`;
    }
    // Return null on the server-side if we can't resolve the host.
    return null;
  }
  
  // If we get here and it's not an empty string, log it for debugging
  console.warn(`Unexpected image URL format: ${trimmedUrl}`);
  return null;
}