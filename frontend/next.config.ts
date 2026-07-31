import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next",
  trailingSlash: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://backend:8000/:path*",
      },
    ];
  },
};

export default nextConfig;