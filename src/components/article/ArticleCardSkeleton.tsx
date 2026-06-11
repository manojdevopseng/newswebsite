import { cn } from "@/lib/utils";

export function ArticleCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-2xl overflow-hidden bg-card border border-border", className)}>
      <div className="h-44 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-20 rounded-full skeleton" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded skeleton" />
          <div className="h-4 w-4/5 rounded skeleton" />
        </div>
        <div className="h-3 w-3/4 rounded skeleton" />
        <div className="flex gap-4">
          <div className="h-3 w-14 rounded skeleton" />
          <div className="h-3 w-14 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function ArticleCardSkeletons({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} className={className} />
      ))}
    </>
  );
}
