// Minimal, chrome-less layout for OBS browser sources. The `.thl-overlay-root`
// marker drives globals.css to make the body transparent and hide the brand
// backdrop, so widgets composite cleanly over the stream. No PageShell, no
// header/footer. QueryProvider is inherited from the root layout, so Realtime
// hooks work here.

export const metadata = {
  robots: { index: false, follow: false },
};

export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  return <div className="thl-overlay-root min-h-screen w-full overflow-hidden">{children}</div>;
}
