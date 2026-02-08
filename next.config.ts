import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  webpack: (config, { dir }) => {
    config.resolve = config.resolve || {};
    config.resolve.modules = [
      path.resolve(dir, "node_modules"),
      ...(config.resolve.modules || []),
    ];
    config.context = dir;
    return config;
  },
};

export default nextConfig;
