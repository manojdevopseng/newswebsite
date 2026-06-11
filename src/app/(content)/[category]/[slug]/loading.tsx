export default function ArticleLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid xl:grid-cols-[1fr_300px] gap-10">
        <div className="space-y-5">
          <div className="h-4 w-48 rounded skeleton" />
          <div className="h-8 w-3/4 rounded skeleton" />
          <div className="h-8 w-1/2 rounded skeleton" />
          <div className="h-5 w-full rounded skeleton" />
          <div className="h-5 w-5/6 rounded skeleton" />
          <div className="aspect-video rounded-2xl skeleton" />
          <div className="space-y-3 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 rounded skeleton" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
        <div className="hidden xl:block">
          <div className="h-64 rounded-2xl skeleton" />
        </div>
      </div>
    </div>
  );
}
