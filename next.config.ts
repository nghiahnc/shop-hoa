import type { NextConfig } from "next";

const nextConfig: NextConfig = { images: { unoptimized: Boolean(process.env.VERCEL) } };
export default nextConfig;
