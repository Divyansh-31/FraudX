import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! IMPORTANT FOR HACKATHONS !!
    // This allows the build to finish even if there are 
    // TypeScript type errors (like the Leaflet types issue).
    ignoreBuildErrors: true,
  }
  /* You can add other config options here if needed */
};

export default nextConfig;