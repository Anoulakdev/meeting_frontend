import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const basePath =
  process.env.APP_ENV === "prod"
    ? "/meeting_notice"
    : "";

const nextConfig: NextConfig = {
  basePath,

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

export default withPWA(nextConfig);