/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows images from any hostname during development
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
