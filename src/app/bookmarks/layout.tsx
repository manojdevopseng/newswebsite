import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Saved Articles — Bookmarks",
  description: "Your saved articles on TechPulseGlobe.",
  alternates: { canonical: `${siteConfig.url}/bookmarks` },
  robots: {
    index:  false,
    follow: false,
  },
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
