import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.16"],

  // Image optimization
  images: {
    remotePatterns: [
      {
        // CloudFront CDN (primary — global edge)
        protocol: "https",
        hostname: "dzdo129ht4o90.cloudfront.net",
      },
      {
        // S3 direct (fallback)
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
  },

  // Security headers
  async headers() {
    const csp = [
      "default-src 'self'",
      // Scripts: self + Google Analytics + Sentry
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://browser.sentry-cdn.com",
      // Styles: self + inline (needed for Tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + CDN + Google + data URIs
      "img-src 'self' data: blob: https://dzdo129ht4o90.cloudfront.net https://*.amazonaws.com https://images.unsplash.com https://picsum.photos https://www.google-analytics.com https://www.gravatar.com https://*.googleusercontent.com",
      // Connect: self + Analytics + Sentry + Meilisearch
      "connect-src 'self' https://www.google-analytics.com https://*.sentry.io https://*.meilisearch.io",
      // Media: self + CDN
      "media-src 'self' https://dzdo129ht4o90.cloudfront.net",
      // Frames: Google Ads
      "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      // Block object/embed
      "object-src 'none'",
      // Base URI
      "base-uri 'self'",
      // Form submissions
      "form-action 'self'",
    ].join("; ")

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "DENY" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security",  value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy",    value: csp },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // www → non-www (permanent 301) — fixes "Page with redirect" in GSC
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.techpulseglobe.com" }],
        destination: "https://techpulseglobe.com/:path*",
        permanent: true,
      },
      // HTTP → HTTPS (catch http://www too)
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://techpulseglobe.com/:path*",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // sharp has native C++ bindings (libvips) — must not be bundled by webpack
  serverExternalPackages: ["sharp"],

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (set in env or leave empty — Sentry auto-detects)
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps if auth token is set — safe to skip in dev
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress Sentry CLI output in build logs
  silent: true,

  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
});
