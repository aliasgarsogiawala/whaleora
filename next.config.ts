import type { NextConfig } from 'next';
import { IMAGE_HOSTS } from './lib/images';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  allowedDevOrigins: ['127.0.0.1'],
  // Built from the same list the studio validates product photo URLs against,
  // so a URL the editor is allowed to save is a URL the optimiser will serve.
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: 'https' as const, hostname, pathname: '/**' })),
  },
  // Older "leave a review" links pointed at /reviews; keep them landing somewhere real.
  async redirects() {
    return [{ source: '/reviews', destination: '/review', permanent: false }];
  },
};

export default nextConfig;
