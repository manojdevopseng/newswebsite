"use client";

import { useEffect, useRef } from "react";

interface GoogleAdProps {
  slot:       string;
  format?:    "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  style?:     React.CSSProperties;
  className?: string;
  layoutKey?: string;   // data-ad-layout-key — required for in-feed fluid ads
  layout?:    string;   // data-ad-layout    — required for in-article fluid ads (e.g. "in-article")
}

const CLIENT      = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

// Returns true only when:
//  1. A real (non-placeholder) AdSense publisher ID is configured, AND
//  2. NEXT_PUBLIC_ADS_ENABLED=true  (flip this in Vercel when AdSense is approved)
export const HAS_REAL_ADSENSE =
  ADS_ENABLED &&
  !!CLIENT &&
  !/^ca-pub-0+$/.test(CLIENT) &&
  !CLIENT.includes("XXXX");

/**
 * Renders a single Google AdSense <ins> unit and calls adsbygoogle.push({}).
 * Returns null if NEXT_PUBLIC_ADSENSE_CLIENT is not set or is a placeholder (dev / pre-approval).
 */
export function GoogleAd({ slot, format = "auto", responsive = true, style, className, layoutKey, layout }: GoogleAdProps) {
  const ref     = useRef<HTMLModElement>(null);
  const pushed  = useRef(false);

  useEffect(() => {
    if (!HAS_REAL_ADSENSE || pushed.current) return;
    try {
      pushed.current = true;
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!HAS_REAL_ADSENSE) return null;

  return (
    <ins
      ref={ref}
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", ...style }}
      data-ad-client={CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      {...(layout    ? { "data-ad-layout":     layout    } : {})}
      {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      {...(responsive ? { "data-full-width-responsive": "true" } : {})}
    />
  );
}
