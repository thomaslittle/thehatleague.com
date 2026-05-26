import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { BrandBackdrop } from "@/components/page/brand-backdrop";
import { requireAdmin } from "@/lib/admin";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/captains", label: "Captains" },
  { href: "/admin/announcements", label: "Announcements" },
];

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
          <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-6 py-4 md:px-10">
            <span className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              League ops
            </span>
            <nav className="flex flex-wrap gap-1 text-sm">
              {TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-md px-3 py-1.5 font-semibold text-neutral-600 transition hover:bg-neutral-200/70 hover:text-thl-orange dark:text-neutral-300 dark:hover:bg-neutral-800/70"
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {children}
      </BrandBackdrop>
    </PageShell>
  );
}
