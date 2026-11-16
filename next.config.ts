import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Serve modern formats; the large PNG/JPG originals in /public are converted on demand.
    formats: ["image/avif", "image/webp"],
  },
  // No Content-Security-Policy yet: it must be written against the real third-party dependencies (fonts are
  // self-hosted by next/font, but inline JSON-LD and Next's own inline scripts need nonces or hashes). Add it
  // once measured in report-only mode. HSTS is left to the hosting layer (set it at Vercel/nginx/Cloudflare).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site uses none of these browser features; deny them so an injected script cannot either.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
