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
        hostname: "lh3.googleusercontent.com", // Add Google user images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // Add GitHub avatars
      },
    ],
  },
};

export default nextConfig;