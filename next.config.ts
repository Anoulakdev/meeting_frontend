import type { NextConfig } from "next";

const basePath =
  process.env.NODE_ENV === "production"
    ? "/meeting_notice"
    : "";

const nextConfig: NextConfig = {
  basePath,
  reactStrictMode: true,
  poweredByHeader: false,

  transpilePackages: [
    "crypto-js",
    "jspdf",
    "jspdf-autotable",
    "xlsx",
  ],

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;