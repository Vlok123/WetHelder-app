/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential Netlify configuration
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure compatibility with serverless
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  }
}

module.exports = nextConfig 