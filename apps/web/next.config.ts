import type { NextConfig } from 'next';

const dashboardRoutes = ['/bangladesh', '/indonesia', '/paraguay'];

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return dashboardRoutes.map((source) => ({
      source,
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      ],
    }));
  },
};

export default nextConfig;
