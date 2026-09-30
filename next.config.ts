import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the hosted preview proxy (and local dev) to reach the dev server.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
};

export default nextConfig;
