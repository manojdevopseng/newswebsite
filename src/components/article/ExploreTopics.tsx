import Link from "next/link";
import { BookOpen, Tag, Folder } from "lucide-react";
import { GLOSSARY } from "@/config/glossary";
import { categories } from "@/config/categories";

interface ExploreTopicsProps {
  tags:         string[];
  categorySlug: string;
  categoryName: string;
}

/**
 * Matches article tags against glossary terms and category pages,
 * providing internal links that improve SEO and user navigation.
 */
export function ExploreTopics({ tags, categorySlug, categoryName }: ExploreTopicsProps) {
  const glossaryKeys = Object.keys(GLOSSARY);

  // Match tags to glossary keys — normalize both sides for comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");

  const matchedGlossaryTerms = glossaryKeys.filter((key) => {
    const glossaryTitle = normalize(GLOSSARY[key].title);
    return tags.some((tag) => {
      const t = normalize(tag);
      return key === t || glossaryTitle.includes(t) || t.includes(key) || key.includes(t);
    });
  }).slice(0, 6);

  // Related categories (same vertical — exclude current)
  const currentCat   = categories.find((c) => c.slug === categorySlug);
  const relatedCats  = categories
    .filter((c) => c.slug !== categorySlug)
    .slice(0, 4);

  if (matchedGlossaryTerms.length === 0 && tags.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-border space-y-6">

      {/* Glossary terms */}
      {matchedGlossaryTerms.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <BookOpen size={15} className="text-accent" />
            Key Terms Explained
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedGlossaryTerms.map((key) => (
              <Link
                key={key}
                href={`/glossary/${key}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/5 border border-accent/15 text-xs font-medium text-accent hover:bg-accent/10 hover:border-accent/30 transition-colors"
              >
                <BookOpen size={10} />
                {GLOSSARY[key].title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Topic tags — link to search */}
      {tags.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Tag size={15} className="text-accent" />
            Topics in This Article
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-fg hover:text-foreground hover:bg-border transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related categories */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Folder size={15} className="text-accent" />
          Explore More
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${categorySlug}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: `${currentCat?.color}15`, color: currentCat?.color, border: `1px solid ${currentCat?.color}30` }}
          >
            All {categoryName} News →
          </Link>
          {relatedCats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-fg hover:text-foreground hover:bg-border transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
