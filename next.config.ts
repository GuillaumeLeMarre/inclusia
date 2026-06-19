import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  async redirects() {
    return [
      { source: "/students", destination: "/profiles", permanent: true },
      { source: "/students/:path*", destination: "/profiles/:path*", permanent: true },
      { source: "/api/students", destination: "/api/profiles", permanent: true },
    ];
  },
};

export default nextConfig;
