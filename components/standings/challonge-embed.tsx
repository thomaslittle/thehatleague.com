// Embeddable Challonge bracket. Challonge serves `/<slug>/module` as a
// drop-in iframe. We render with lazy loading + a soft loading state.

export function ChallongeEmbed({
  slug,
  title,
  height = 540,
}: {
  /** The bit after `https://challonge.com/`, e.g. `9xmo6e8m`. */
  slug: string;
  title: string;
  height?: number;
}) {
  const src = `https://challonge.com/${slug}/module?theme=dark&show_final_results=1`;
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <div className="text-sm font-bold tracking-tight">{title}</div>
        <a
          href={`https://challonge.com/${slug}`}
          target="_blank"
          rel="noopener"
          className="text-xs font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Open in Challonge ↗
        </a>
      </div>
      <iframe
        src={src}
        title={title}
        height={height}
        width="100%"
        loading="lazy"
        className="block bg-white dark:bg-black"
      />
    </div>
  );
}
