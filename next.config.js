/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/community',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/community/:slug*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
