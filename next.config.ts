import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.resolve(projectRoot, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
