/**
 * Instancia ÚNICA de TanStack Query (estado del servidor: caché, refetch,
 * invalidación). La usa el QueryClientProvider de main.tsx.
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // si la API responde un error, se muestra enseguida
      refetchOnWindowFocus: false,
      staleTime: 30_000, // 30 s: los datos se consideran frescos
    },
  },
});
