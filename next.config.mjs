/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true, // Enables faster builds with the SWC compiler
  poweredByHeader: false, // Hides the 'X-Powered-By: Next.js' header
  eslint: {
    ignoreDuringBuilds: true, // Prevents ESLint errors from breaking builds
  },
  typescript: {
    ignoreBuildErrors: true, // Prevents TypeScript errors from breaking builds
  },
  experimental: {
    // Enable experimental features if needed
    serverActions: true, // Example: enable server actions if using Next.js App Router
  },
};

export default nextConfig;
