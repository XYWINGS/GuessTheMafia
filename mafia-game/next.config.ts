import type { NextConfig } from "next";

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};
export default nextConfig;
