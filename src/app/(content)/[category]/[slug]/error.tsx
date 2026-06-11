"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle } from "lucide-react";

export default function ArticleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
      <AlertCircle size={40} className="text-accent-orange" />
      <h2 className="text-xl font-bold">Failed to load article</h2>
      <p className="text-muted-fg text-sm">Something went wrong while loading this article.</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
