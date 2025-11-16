export function getSiteUrl(): string {
  // In production, use the environment variable if available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // On the client side, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Fallback for server-side
  return 'http://localhost:3000'
}