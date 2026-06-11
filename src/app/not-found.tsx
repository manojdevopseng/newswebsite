import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
        <FileQuestion size={28} className="text-muted-fg" />
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-fg text-lg">This page doesn&apos;t exist.</p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className="px-5 py-2.5 rounded-xl border border-border text-muted-fg hover:text-foreground hover:border-accent/40 transition-colors text-sm"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
