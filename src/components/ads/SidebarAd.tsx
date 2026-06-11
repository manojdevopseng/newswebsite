"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GoogleAd } from "./GoogleAd";

interface SidebarAdProps {
  slot:      string;
  size?:     "medium-rectangle" | "half-page";
  className?: string;
}

const SIZE_MAP = {
  "medium-rectangle": { width: 300, height: 250 },
  "half-page":        { width: 300, height: 600 },
} as const;

const HAS_ADSENSE = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const isValidSlot = (s: string) => /^\d{6,12}$/.test(s);

export function SidebarAd({ slot, size = "medium-rectangle", className }: SidebarAdProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dims    = SIZE_MAP[size];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: "100px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!HAS_ADSENSE || !isValidSlot(slot)) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "hidden lg:flex flex-col items-center rounded-xl border border-border bg-muted/20",
        className
      )}
      style={{ width: dims.width, minHeight: dims.height }}
      aria-label="Advertisement"
    >
      {visible ? (
        HAS_ADSENSE && isValidSlot(slot) ? (
          <div className="w-full">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 text-center pt-2">Advertisement</p>
            <GoogleAd
              slot={slot}
              format="rectangle"
              responsive={false}
              style={{ width: dims.width, height: dims.height }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 mb-2">Advertisement</p>
            <div
              className="bg-muted/50 rounded-lg skeleton"
              style={{ width: dims.width - 24, height: dims.height - 40 }}
            />
          </div>
        )
      ) : (
        <div style={{ height: dims.height }} />
      )}
    </div>
  );
}
