"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserPrefsStore } from "@/store/userPrefsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { GoogleAd, HAS_REAL_ADSENSE } from "./GoogleAd";

const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT ?? "";

interface StickyMobileAdProps {
  slot?: string;
}

export function StickyMobileAd({ slot }: StickyMobileAdProps) {
  const hydrated = useHydrated();
  const { dismissedMobileAd, dismissMobileAd } = useUserPrefsStore();
  const [scrolled, setScrolled] = useState(false);
  const adSlot = slot ?? DEFAULT_SLOT;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!hydrated || dismissedMobileAd || !scrolled || !HAS_REAL_ADSENSE || !adSlot) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 lg:hidden",
        "flex items-center justify-between gap-2 px-3 py-2",
        "bg-card/95 backdrop-blur border-t border-border shadow-lg"
      )}
      style={{ minHeight: 56 }}
      aria-label="Advertisement"
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 shrink-0">Ad</p>

      <div className="flex-1">
        {HAS_REAL_ADSENSE && adSlot ? (
          <GoogleAd
            slot={adSlot}
            format="auto"
            responsive
            style={{ display: "inline-block", width: "100%", height: 50 }}
          />
        ) : (
          <div className="h-[50px] rounded-lg bg-muted/50 skeleton" />
        )}
      </div>

      <button
        onClick={dismissMobileAd}
        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors"
        aria-label="Dismiss ad"
      >
        <X size={12} />
      </button>
    </div>
  );
}
