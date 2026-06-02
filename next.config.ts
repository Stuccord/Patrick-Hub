import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  basePath: isProd ? "/Patrick-Hub" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
