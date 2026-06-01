import Link from "next/link";
import { Play, Film, FileDown, Image as ImageIcon } from "lucide-react";
import { DeleteAssetButton } from "./delete-asset-button";
import type { AssetKind, AssetView } from "@/lib/data/assets";

function KindIcon({ kind }: { kind: AssetKind }) {
  if (kind === "replay") return <Film className="h-9 w-9" aria-hidden />;
  if (kind === "file") return <FileDown className="h-9 w-9" aria-hidden />;
  if (kind === "image") return <ImageIcon className="h-9 w-9" aria-hidden />;
  return <Play className="h-9 w-9" aria-hidden />;
}

function defaultLabel(kind: AssetKind): string {
  return kind === "replay" ? "Replay" : kind === "image" ? "Screenshot" : kind === "file" ? "File" : "Clip";
}

function AssetCard({ asset, canModerate }: { asset: AssetView; canModerate: boolean }) {
  const label = asset.title ?? defaultLabel(asset.kind);
  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <a
        href={asset.url}
        target="_blank"
        rel="noopener"
        className="relative block aspect-video bg-neutral-100 dark:bg-neutral-900"
      >
        {asset.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={label} className="h-full w-full object-cover" />
        ) : asset.thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
              <Play className="h-10 w-10" aria-hidden />
            </span>
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-thl-orange">
            <KindIcon kind={asset.kind} />
          </span>
        )}
      </a>
      <div className="flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{label}</div>
          <div className="truncate text-xs text-neutral-500">
            {asset.uploader.username ? (
              <Link
                href={`/players/${encodeURIComponent(asset.uploader.username)}`}
                className="hover:text-thl-orange"
              >
                {asset.uploader.name}
              </Link>
            ) : (
              asset.uploader.name
            )}
          </div>
        </div>
        {(asset.mine || canModerate) && <DeleteAssetButton id={asset.id} />}
      </div>
    </div>
  );
}

/** Grid of attached clips/assets (video tiles, image previews, replay/file links). */
export function AssetGallery({
  assets,
  canModerate = false,
}: {
  assets: AssetView[];
  canModerate?: boolean;
}) {
  if (assets.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((a) => (
        <AssetCard key={a.id} asset={a} canModerate={canModerate} />
      ))}
    </div>
  );
}
