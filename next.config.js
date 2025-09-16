const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n/request.ts'
);

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

module.exports = withNextIntl(nextConfig);