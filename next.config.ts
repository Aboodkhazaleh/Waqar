import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Whitelist external image hosts so <Image /> can optimize them
    // without returning 400 Bad Request from /_next/image.
    remotePatterns: [
      // Firebase Storage (default for getDownloadURL() responses)
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      // Google Cloud Storage (sometimes used by Firebase Storage buckets)
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      // Project-specific Firebase Storage hostname (newer .firebasestorage.app bucket)
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
        pathname: "/**",
      },
      // Project-specific Firebase Storage hostname (classic .appspot.com bucket)
      {
        protocol: "https",
        hostname: "*.appspot.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384, 512],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
