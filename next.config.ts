import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, 
};
module.exports = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },// Disable React Strict Mode to reduce warnings
};

export default nextConfig;
