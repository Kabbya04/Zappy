export function debugGetSiteUrl(): { url: string; source: string } {
  // Check all possible sources
  const sources = {
    envVar: process.env.NEXT_PUBLIC_SITE_URL,
    windowOrigin: typeof window !== 'undefined' ? window.location.origin : null,
    hostname: typeof window !== 'undefined' ? window.location.hostname : null,
    href: typeof window !== 'undefined' ? window.location.href : null,
  }
  
  console.log('Debug - Site URL sources:', sources)
  
  // In production, use the environment variable if available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    console.log('Debug - Using environment variable:', process.env.NEXT_PUBLIC_SITE_URL)
    return { url: process.env.NEXT_PUBLIC_SITE_URL, source: 'env_var' }
  }
  
  // On the client side, use window.location.origin
  if (typeof window !== 'undefined') {
    console.log('Debug - Using window.location.origin:', window.location.origin)
    return { url: window.location.origin, source: 'window_origin' }
  }
  
  // Fallback for server-side
  console.log('Debug - Using fallback localhost')
  return { url: 'http://localhost:3000', source: 'fallback' }
}