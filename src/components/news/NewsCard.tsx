import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/news";
import { NewsImage } from "./NewsImage";
import {
  DemoBadge,
  NewsSourceBadge,
  NewsTag,
  ResearchOrbitBadge,
  formatNewsDate,
} from "./NewsBadges";

function ReadOnSource({ article, className }: { article: NewsArticle; className?: string }) {
  return (
    <a
      href={article.articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Read this article on ${article.sourceName}, opens in a new tab`}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs text-foreground transition-colors hover:border-primary/45 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className,
      )}
    >
      Read on {article.sourceName}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

type CardProps = { article: NewsArticle; isDemo?: boolean };

/** Standard grid card. */
export function NewsCard({ article, isDemo }: CardProps) {
  return (
    <article className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:bg-white/[0.06]">
      <NewsImage
        src={article.imageUrl}
        alt={article.imageAlt ?? article.title}
        category={article.category}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <NewsTag>{article.category}</NewsTag>
          {article.isResearchOrbit && <ResearchOrbitBadge compact />}
          {isDemo && <DemoBadge />}
        </div>
        <h3 className="mt-3 font-display text-base font-semibold leading-snug text-foreground">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
        <dl className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <dt className="sr-only">Source</dt>
          <dd className="min-w-0">
            <NewsSourceBadge article={article} />
          </dd>
          <dt className="sr-only">Published</dt>
          <dd>
            <time dateTime={article.publishedAt} className="font-mono">
              {formatNewsDate(article.publishedAt)}
            </time>
          </dd>
          {article.author && (
            <>
              <dt className="sr-only">Author</dt>
              <dd className="min-w-0 truncate">{article.author}</dd>
            </>
          )}
        </dl>

        <div className="mt-4">
          <ReadOnSource article={article} />
        </div>
      </div>
    </article>
  );
}

/** Dominant lead story used at the top of the Cosmic Briefing. */
export function NewsLeadCard({ article, isDemo }: CardProps) {
  return (
    <article className="glass group overflow-hidden rounded-2xl">
      <NewsImage
        src={article.imageUrl}
        alt={article.imageAlt ?? article.title}
        category={article.category}
        eager
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-col justify-center p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <NewsTag>{article.category}</NewsTag>
          {article.isResearchOrbit && <ResearchOrbitBadge />}
          {isDemo && <DemoBadge />}
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight md:text-3xl">
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {article.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <NewsSourceBadge article={article} />
          <time dateTime={article.publishedAt} className="font-mono">
            {formatNewsDate(article.publishedAt)}
          </time>
          {article.newsType && <NewsTag>{article.newsType}</NewsTag>}
        </div>
        <div className="mt-6">
          <ReadOnSource article={article} />
        </div>
      </div>
    </article>
  );
}

/** Compact supporting card (briefing column, Research Orbit row). */
export function NewsCompactCard({ article, isDemo }: CardProps) {
  return (
    <article className="glass flex h-full gap-4 overflow-hidden rounded-2xl p-4 transition-colors duration-300 hover:bg-white/[0.06]">
      <NewsImage
        src={article.imageUrl}
        alt={article.imageAlt ?? article.title}
        category={article.category}
        className="hidden h-20 w-24 shrink-0 rounded-xl sm:block"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <NewsTag>{article.category}</NewsTag>
          {article.isResearchOrbit && <ResearchOrbitBadge compact />}
          {isDemo && <DemoBadge />}
        </div>
        <h3 className="mt-2 font-display text-sm font-semibold leading-snug">{article.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <NewsSourceBadge article={article} />
          <time dateTime={article.publishedAt} className="font-mono">
            {formatNewsDate(article.publishedAt)}
          </time>
        </div>
        <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read this article on ${article.sourceName}, opens in a new tab`}
          className="mt-3 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Read on {article.sourceName}
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </article>
  );
}
