"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareOnTwitter = () => window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    "_blank"
  );
  const shareOnLinkedIn = () => window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    "_blank"
  );
  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnClass = "flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border text-muted-fg hover:text-foreground hover:border-accent/40 transition-all duration-150";

  return (
    <div className={cn("flex xl:flex-col items-center gap-2", className)}>
      <p className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold xl:mb-1 hidden xl:block text-center">Share</p>
      <button onClick={shareOnTwitter} className={btnClass} aria-label="Share on Twitter">
        <Twitter size={14} />
      </button>
      <button onClick={shareOnLinkedIn} className={btnClass} aria-label="Share on LinkedIn">
        <Linkedin size={14} />
      </button>
      <button onClick={copyLink} className={cn(btnClass, copied && "text-green-400 border-green-400/40")} aria-label="Copy link">
        {copied ? <Check size={14} /> : <Link2 size={14} />}
      </button>
    </div>
  );
}
