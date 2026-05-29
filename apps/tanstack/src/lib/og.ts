// Per-route Open Graph / Twitter Card meta tag helper. The root layout
// sets sensible defaults; routes call this to override title/description
// without re-typing every property name.

interface OgOpts {
  title: string;
  description: string;
  /** Override the share image. Defaults to the brand logo. */
  image?: string;
  /** When true, route the share image at `/api/og?…` so it's generated
   *  dynamically with the page's title + subtitle baked in. Overrides
   *  `image`. */
  dynamic?: boolean;
  /** Eyebrow line above the title in the dynamic card. */
  eyebrow?: string;
  /** Subtitle below the title in the dynamic card. Falls back to the
   *  description. */
  subtitle?: string;
}

export function ogMeta(
  opts: OgOpts,
): Array<{
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}> {
  let image = opts.image ?? "/brand/thl-logo.png";
  if (opts.dynamic) {
    const params = new URLSearchParams({
      title: opts.title,
      subtitle: opts.subtitle ?? opts.description,
      eyebrow: opts.eyebrow ?? "Season 04",
    });
    image = `/api/og?${params.toString()}`;
  }
  return [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:image", content: image },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
  ];
}
