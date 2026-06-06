"use client";

import { useSyncExternalStore } from "react";

const FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

const subscribe = () => () => {};

/**
 * Render a timestamp in the VIEWER's local timezone. Formatting has to happen
 * on the client (the server has its own timezone), so the server snapshot is a
 * neutral placeholder and the client snapshot is the localized time.
 * `useSyncExternalStore` swaps them at hydration without a setState-in-effect.
 */
export function LocalTime({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => new Date(iso).toLocaleString(undefined, FORMAT),
    () => "soon",
  );
  return <span suppressHydrationWarning>{text}</span>;
}
