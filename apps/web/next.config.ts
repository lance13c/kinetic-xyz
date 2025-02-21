// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: 'http://localhost:3001/graphql',
      },
    ];
  },
};

module.exports = nextConfig;
