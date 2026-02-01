import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Allow images from all domains (news sources can be from anywhere)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Enable unoptimized mode for external images to avoid domain restrictions
    unoptimized: false,
  },
  // Allow build to continue even if fonts can't be fetched
  experimental: {
    optimizePackageImports: ["next/font/google"],
  },
};

export default nextConfig;
