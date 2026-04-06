import type { NextConfig } from "next";
import path from "path";
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
    root: path.resolve(__dirname, "../../.."),
  },
};

export default nextConfig;
