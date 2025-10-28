import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry once on failure
      refetchOnWindowFocus: false, // do not refetch when tab regains focus
      staleTime: 1000 * 60, // data is fresh for 1 minute
    },
    mutations: {
      retry: 1,
    },
  },
});
