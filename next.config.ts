import type { NextConfig } from "next";
import { basePath } from "./lib/site";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isProduction ? basePath : undefined,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
