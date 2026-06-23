import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "sharp"],
  async redirects() {
    return [
      { source: "/students", destination: "/learners", permanent: true },
      { source: "/students/:path*", destination: "/learners/:path*", permanent: true },
      { source: "/api/students", destination: "/api/learners", permanent: true },
    ];
  },
};

export default nextConfig;
