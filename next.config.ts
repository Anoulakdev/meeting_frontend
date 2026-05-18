import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  transpilePackages: ["crypto-js", "jspdf", "jspdf-autotable", "xlsx"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
