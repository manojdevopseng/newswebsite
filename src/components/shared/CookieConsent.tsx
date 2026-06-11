"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

const COOKIE_KEY = "tpg-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't decided yet
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50
        bg-card border border-border rounded-2xl shadow-2xl shadow-black/30 p-5
        animate-in slide-in-from-bottom-4 duration-300"
    >
      {/* Close button */}
      <button
        onClick={decline}
        aria-label="Decline cookies"
        className="absolute top-3 right-3 text-muted-fg hover:text-foreground transition-colors"
      >
        <X size={15} />
      </button>

      {/* Icon + heading */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Cookie size={15} className="text-accent" />
        </div>
        <h3 className="font-semibold text-sm">We use cookies</h3>
      </div>

      {/* Body */}
      <p className="text-xs text-muted-fg leading-relaxed mb-4">
        We use cookies for analytics (Google Analytics) and personalised ads (Google AdSense).
        By clicking &ldquo;Accept&rdquo;, you consent to our use of cookies.{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </Link>
      </p>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl
            bg-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Check size={12} /> Accept
        </button>
        <button
          onClick={decline}
          className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-fg
            text-xs font-medium hover:text-foreground hover:border-accent/30 transition-all"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
