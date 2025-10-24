import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artworks.thetvdb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'banners.thetvdb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;