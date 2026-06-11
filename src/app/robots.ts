import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Main rule: allow all legitimate search crawlers ──────────────────
      {
        userAgent: "*",
        allow: ["/", "/api/sitemap/", "/api/feed"],
        disallow: [
          "/api/",      // all other API routes — JSON, not indexable
          "/_next/",    // Next.js internals
          "/admin/",    // CMS admin — never index
          "/search",    // search results page — noindex anyway
        ],
      },

      // ── Block AI training crawlers — content is proprietary ──────────────
      { userAgent: "GPTBot",            disallow: "/" },
      { userAgent: "ChatGPT-User",      disallow: "/" },
      { userAgent: "CCBot",             disallow: "/" },
      { userAgent: "anthropic-ai",      disallow: "/" },
      { userAgent: "ClaudeBot",         disallow: "/" },
      { userAgent: "Google-Extended",   disallow: "/" },
      { userAgent: "Amazonbot",         disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
      { userAgent: "Bytespider",        disallow: "/" },
      { userAgent: "meta-externalagent", disallow: "/" },
      { userAgent: "PerplexityBot",     disallow: "/" },
      { userAgent: "YouBot",            disallow: "/" },
      { userAgent: "cohere-ai",         disallow: "/" },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/api/sitemap/news`,
      `${siteConfig.url}/api/sitemap/images`,
    ],
    host:    siteConfig.url,
  };
}
