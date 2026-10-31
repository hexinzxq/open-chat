import path from "node:path";

import type { NextConfig } from "next";

const isStatic = process.env.NEXT_STATIC === "1";
const basePath = process.env.NEXT_BASE_PATH || undefined;

const nextConfig: NextConfig = isStatic
  ? {
      // 纯静态产物（GitHub Pages）：没有服务端，/api/chat 不存在，前端会自动直连上游
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      reactStrictMode: true,
    }
  : {
      output: "standalone",
      outputFileTracingRoot: path.join(__dirname, "../.."),
      reactStrictMode: true,
    };

export default nextConfig;
