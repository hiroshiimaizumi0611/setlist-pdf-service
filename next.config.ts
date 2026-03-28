import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@cloudflare/playwright"],
};

export default nextConfig;
