"use client";

import { useEffect } from "react";

/**
 * Sets document.documentElement.lang on mount and restores on unmount.
 * Used by Hindi article pages to override the root layout's lang="en".
 */
export function HtmlLangSetter({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = prev;
    };
  }, [lang]);

  return null;
}
