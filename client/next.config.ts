import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL;
    const backendUrl = rawBackendUrl ? rawBackendUrl.replace(/\/+$/, "") : "";

    if (backendUrl && !backendUrl.includes("localhost") && !backendUrl.includes("127.0.0.1")) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: "/uploads/:path*",
          destination: `${backendUrl}/uploads/:path*`,
        },
      ];
    }

    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
        {
          source: "/uploads/:path*",
          destination: "http://localhost:5000/uploads/:path*",
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
