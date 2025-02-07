// import { i18n } from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3030',
        pathname: '/**',
      },
    ],
  },
  // i18n,
};

export default nextConfig;
