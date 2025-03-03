/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable static optimization for API routes to ensure they work properly even in static export
  // This is important for Supabase integration
  output: 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Enable Pages Router along with App Router for backward compatibility
  experimental: {
    appDir: true,
  },
  // Custom rewrites to handle routing issues
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/app/page',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;