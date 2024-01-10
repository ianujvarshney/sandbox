/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
