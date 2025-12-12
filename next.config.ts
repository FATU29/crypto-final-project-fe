import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.coindesk.com",
      },
      {
        protocol: "https",
        hostname: "**.cointelegraph.com",
      },
      {
        protocol: "https",
        hostname: "**.bloomberg.com",
      },
      {
        protocol: "https",
        hostname: "**.reuters.com",
      },
    ],
  },
};

export default nextConfig;
