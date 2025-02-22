import { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'images.coingecko.com',
        pathname: '/coins/**',
        protocol: 'https',
      },
      {
        hostname: 'coin-images.coingecko.com',
        pathname: '/coins/**',
        protocol: 'https',
      },
      {
        hostname: 'assets.coingecko.com',
        pathname: '/coins/**',
        protocol: 'https',
      }
    ]
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
