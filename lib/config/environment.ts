// Environment detection and URL configuration
export function getEnvironmentUrl(): string {
  // Client-side: always use current origin
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin
    console.log(`Client-side: Using current origin: ${currentOrigin}`)
    return currentOrigin
  }
  
  // Server-side: check for environment variables
  if (process.env.VERCEL_URL) {
    // Vercel deployment
    const url = `https://${process.env.VERCEL_URL}`
    console.log(`Server-side: Using Vercel URL: ${url}`)
    return url
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    // Custom site URL
    console.log(`Server-side: Using custom site URL: ${process.env.NEXT_PUBLIC_SITE_URL}`)
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Fallback
  console.log(`Server-side: Using fallback localhost`)
  return 'http://localhost:3000'
}

// Force production URL for OAuth (this is the key fix)
export function getOAuthRedirectUrl(): string {
  // Always use the environment variable if available (this gets baked in at build time)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Fallback to current origin on client
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  return 'http://localhost:3000'
}