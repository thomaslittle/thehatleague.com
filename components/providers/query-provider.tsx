"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Keep server-rendered data warm; let Server Components be the source
        // of truth for the first paint, and only re-validate on the client.
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazy-init so we don't recreate the client on every render in the browser.
  const [client] = useState(() => getQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
