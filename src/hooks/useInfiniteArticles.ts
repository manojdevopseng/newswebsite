"use client";

import useSWRInfinite from "swr/infinite";
import type { ArticlePreview, PaginatedResponse } from "@/types";

// Throw on HTTP errors so SWR treats them as errors, not data
const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
};

export function useInfiniteArticles(category?: string) {
  const getKey = (pageIndex: number, prev: PaginatedResponse<ArticlePreview> | null) => {
    if (prev && !prev.hasMore) return null;
    const params = new URLSearchParams({ page: String(pageIndex + 1), limit: "10" });
    if (category) params.set("category", category);
    return `/api/articles?${params}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<
    PaginatedResponse<ArticlePreview>
  >(getKey, fetcher, { revalidateFirstPage: false });

  // Guard: filter out any undefined/null items that sneak in on API errors
  const articles = data
    ? data.flatMap((d) => d?.data ?? []).filter((a): a is ArticlePreview => !!a && !!a._id)
    : [];

  const hasMore  = data ? !!data[data.length - 1]?.hasMore : false;
  const loadMore = () => setSize(size + 1);

  return { articles, hasMore, loadMore, isLoading, isValidating, error, size };
}
