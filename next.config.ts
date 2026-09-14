import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' }],
  },
  // Older "leave a review" links pointed at /reviews; keep them landing somewhere real.
  async redirects() {
    return [{ source: '/reviews', destination: '/review', permanent: false }];
  },
};

export default nextConfig;
