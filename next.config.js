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
      {
        source: '/learn/reverse-insulin-resistance-naturally',
        destination: '/learn/improve-insulin-sensitivity-evidence',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
