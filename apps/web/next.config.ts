import { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ['coin-images.coingecko.com'],
  },
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: 'http://localhost:3001/graphql',
      },
    ];
  },
} satisfies NextConfig;

module.exports = nextConfig;
