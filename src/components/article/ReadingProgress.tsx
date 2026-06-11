"use client";

import { useReadingProgress } from "@/hooks/useReadingProgress";

export function ReadingProgress() {
  const progress = useReadingProgress();
  return (
    <div className="fixed top-0 inset-x-0 z-50 h-0.5 bg-border">
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
