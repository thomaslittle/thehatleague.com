import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ErrorScreen } from "@/components/error-screen";
import { NotFound } from "@/components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ({ error, reset }) => (
      <ErrorScreen error={error} reset={reset} />
    ),
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
