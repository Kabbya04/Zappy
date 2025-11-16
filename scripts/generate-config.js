const fs = require('fs')
const path = require('path')

// Generate site configuration at build time
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const configContent = `// Auto-generated configuration file - DO NOT EDIT
export const BUILT_SITE_URL = '${siteUrl}'

export function getBuiltSiteUrl(): string {
  // Client-side: use current origin if different from built URL
  if (typeof window !== 'undefined') {
    // If we're on localhost but built for production, use current origin
    if (window.location.origin.includes('localhost') && !BUILT_SITE_URL.includes('localhost')) {
      return window.location.origin
    }
    // If we're on production but built for localhost, use current origin
    if (!window.location.origin.includes('localhost') && BUILT_SITE_URL.includes('localhost')) {
      return window.location.origin
    }
    return BUILT_SITE_URL
  }
  
  return BUILT_SITE_URL
}
`

const configPath = path.join(__dirname, '..', 'lib', 'config', 'built-site.ts')
fs.writeFileSync(configPath, configContent)

console.log('✅ Generated site configuration with URL:', siteUrl)