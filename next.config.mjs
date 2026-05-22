/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH || "";
const nextOutput = process.env.NEXT_OUTPUT;

const nextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  output:
    nextOutput === "standalone" || nextOutput === "export"
      ? nextOutput
      : undefined,
};

export default nextConfig;
