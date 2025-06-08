/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true
  },
  serverExternalPackages: ['@prisma/client'],
  // Optimize for faster builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  // For Netlify deployment
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig 