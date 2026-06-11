import Image from "next/image";
import Link from "next/link";
import { Twitter, Linkedin } from "lucide-react";
import type { Author } from "@/types";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border mt-10">
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={56}
          height={56}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl shrink-0">
          {author.name[0]}
        </div>
      )}
      <div className="flex-1">
        <Link href={`/authors/${author.slug}`} className="font-semibold hover:text-accent transition-colors">
          {author.name}
        </Link>
        {(author.expertise?.length ?? 0) > 0 && (
          <p className="text-xs text-muted-fg mt-0.5">{author.expertise.join(" · ")}</p>
        )}
        {author.bio && (
          <p className="text-sm text-muted-fg mt-2 leading-relaxed">{author.bio}</p>
        )}
        <div className="flex gap-2 mt-3">
          {author.twitter && (
            <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors">
              <Twitter size={13} />
            </a>
          )}
          {author.linkedin && (
            <a href={author.linkedin} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors">
              <Linkedin size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
