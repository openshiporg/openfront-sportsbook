import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['graphql'],
  // The bounded sportsbook has no remote image ingestion. This keeps the image
  // optimizer and arbitrary provider URLs outside the production trust boundary.
  images: { unoptimized: true, remotePatterns: [] },
};

export default nextConfig;
