"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TocItem { id: string; text: string; level: number; }

interface TableOfContentsProps {
  contentSelector?: string;
}

export function TableOfContents({ contentSelector = ".article-content" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const content = document.querySelector(contentSelector);
    if (!content) return;

    const headings = Array.from(content.querySelectorAll("h2, h3")) as HTMLHeadingElement[];
    const parsed: TocItem[] = headings.map((h) => {
      if (!h.id) h.id = h.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "";
      return { id: h.id, text: h.textContent || "", level: Number(h.tagName[1]) };
    });
    setItems(parsed);
  }, [contentSelector]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
        <List size={14} className="text-muted-fg" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg">Contents</span>
      </div>
      <nav>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block text-xs leading-relaxed py-1 transition-colors rounded px-2",
                  item.level === 3 && "pl-4",
                  activeId === item.id
                    ? "text-accent font-medium bg-accent/5"
                    : "text-muted-fg hover:text-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
