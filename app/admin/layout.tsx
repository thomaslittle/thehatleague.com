import { PageShell } from "@/components/page/page-shell";
import { BrandBackdrop } from "@/components/page/brand-backdrop";
import { requireAdmin } from "@/lib/admin";
import { AdminTabsNav } from "@/components/admin/admin-tabs-nav";

export const metadata = {
  title: "League ops",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Block non-admins before rendering any admin chrome.
  await requireAdmin("/admin");

  return (
    <PageShell>
      <BrandBackdrop>
        <div className="border-b border-neutral-200/70 bg-neutral-50/70 backdrop-blur-sm dark:border-neutral-900/70 dark:bg-neutral-950/60">
          <div className="mx-auto max-w-[1320px] px-6 py-4 md:px-10">
            {/* Eyebrow only shown alongside the desktop nav. On mobile the
                dropdown's own "Section" label carries the same info, so
                doubling up reads as clutter. */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
              <span className="hidden text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase md:inline">
                League ops
              </span>
              <AdminTabsNav />
            </div>
          </div>
        </div>
        {children}
      </BrandBackdrop>
    </PageShell>
  );
}
