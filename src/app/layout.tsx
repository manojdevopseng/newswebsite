import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { generateRootMetadata } from "@/lib/seo/metadata";
import { websiteSchema, organizationSchema } from "@/lib/seo/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = generateRootMetadata();

const GA_ID       = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Preconnect to critical origins — reduces connection latency */}
        <link rel="preconnect" href="https://dzdo129ht4o90.cloudfront.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://browser.sentry-cdn.com" />

        {/* JSON-LD schemas — plain script tags so Googlebot reads them server-side */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <LayoutShell>{children}</LayoutShell>
        <CookieConsent />

        {/* GA + AdSense — skipped on /admin/* routes, see GoogleAnalytics component */}
        {GA_ID && (
          <GoogleAnalytics gaId={GA_ID} adsenseClient={ADSENSE_CLIENT} />
        )}

      </body>
    </html>
  );
}
