"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchStore } from "@/store/searchStore";
import { formatRelativeDate, cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/article/CategoryBadge";
import type { SearchResult } from "@/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchModal() {
  const { isOpen, close, query, setQuery, results, setResults, setIsLoading, isLoading, selectedIndex, setSelectedIndex } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Load trending searches
  useEffect(() => {
    if (!isOpen || trendingSearches.length > 0) return;
    fetch("/api/search/trending")
      .then((r) => r.json())
      .then((d) => { if (d.trending?.length) setTrendingSearches(d.trending); })
      .catch(() => {});
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }

    // Cancel previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`, { signal })
      .then((r) => r.json())
      .then((d) => { setResults(d.hits ?? []); setIsLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setResults([]); setIsLoading(false); } });

    return () => abortRef.current?.abort();
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(Math.max(selectedIndex - 1, -1)); }
      if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
        const r = results[selectedIndex] as SearchResult;
        window.location.href = `/${r.categorySlug}/${r.slug}`;
        close();
      }
    },
    [close, selectedIndex, setSelectedIndex, results]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search size={18} className="text-muted-fg shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, topics, AI tools..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-fg"
                />
                {isLoading && (
                  <Loader2 size={16} className="text-muted-fg animate-spin shrink-0" />
                )}
                <button
                  onClick={close}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors shrink-0"
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query && results.length > 0 && (
                  <div className="p-2">
                    {(results as SearchResult[]).map((result, i) => (
                      <Link
                        key={result.id}
                        href={`/${result.categorySlug}/${result.slug}`}
                        onClick={close}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl transition-colors group",
                          i === selectedIndex ? "bg-accent/10" : "hover:bg-muted"
                        )}
                      >
                        {result.featuredImage && (
                          <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image src={result.featuredImage} alt={result.title} fill className="object-cover" sizes="48px" quality={65} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CategoryBadge slug={result.categorySlug} name={result.category} size="sm" asLink={false} />
                          <p className="mt-0.5 text-sm font-medium line-clamp-1 group-hover:text-accent transition-colors">
                            {result.title}
                          </p>
                          <p className="text-xs text-muted-fg">{formatRelativeDate(result.publishedAt)}</p>
                        </div>
                        <ArrowRight size={14} className="text-muted-fg shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                )}

                {query && !isLoading && results.length === 0 && (
                  <div className="p-8 text-center text-muted-fg">
                    <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs mt-1">Try different keywords</p>
                  </div>
                )}

                {!query && trendingSearches.length > 0 && (
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-1.5">
                      <TrendingUp size={12} />
                      Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-border text-muted-fg hover:text-foreground transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-fg">
                <span>&#8593;&#8595; navigate &middot; Enter select &middot; Esc close</span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">Ctrl K</kbd>
                  to toggle
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
