"use client";

import {
  QueryClient as QueryClient_,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient_({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const QueryClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
