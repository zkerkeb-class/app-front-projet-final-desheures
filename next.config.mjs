/** @type {import('next').NextConfig} */

// import pkg from './next-i18next.config.js';
// const { i18n } = pkg;

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost'], // Ajouter localhost ici pour autoriser l'usage des images en local
  },
  // i18n,
};

export default nextConfig;
