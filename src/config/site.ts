export const siteConfig = {
  name: "TechPulseGlobe",
  tagline: "AI · Finance · Tech Intelligence",
  description:
    "Premium AI-powered intelligence platform covering AI, Finance, Technology, Startups, and Investing. Your global tech media destination.",
  url: process.env.NEXT_PUBLIC_URL || "https://techpulseglobe.com",
  ogImage: "/opengraph-image",
  logo: "/images/logo.svg",
  twitter: "@TechPulseG1310",
  locale: "en_IN",
  keywords: [
    "AI news",
    "finance news India",
    "tech news",
    "startup news",
    "artificial intelligence",
    "investing India",
    "fintech",
    "cloud AWS",
  ],
  authors: [{ name: "TechPulseGlobe Team", url: "https://techpulseglobe.com" }],
  creator: "TechPulseGlobe",
  publisher: "TechPulseGlobe Media",
} as const;

export type SiteConfig = typeof siteConfig;
