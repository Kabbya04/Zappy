// Site configuration that gets built at compile time
export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  name: 'Zappy',
  description: 'Your app description',
} as const

// Helper function to get the site URL with fallback logic
export function getSiteUrl(): string {
  // If we have an environment variable, use it
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Client-side: use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side fallback
  return SITE_CONFIG.url
}