/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
};

export default nextConfig;
