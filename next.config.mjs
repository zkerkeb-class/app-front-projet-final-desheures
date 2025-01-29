/** @type {import('next').NextConfig} */
import i18nConfig from './next-i18next.config.js';

const nextConfig = {
  ...i18nConfig,
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
};

export default nextConfig;
