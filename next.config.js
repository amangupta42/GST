/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable experimental features as needed
  },
  // PWA support will be added later
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    // During build, treat TypeScript errors as warnings in development
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig