import { QueryCache, QueryClient } from '@tanstack/react-query';
import { emitToast } from './toastBus';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const messageFromMeta = query.meta?.errorMessage;
      const message =
        typeof messageFromMeta === 'string' && messageFromMeta.length > 0
          ? messageFromMeta
          : error instanceof Error
            ? error.message
            : 'Request failed. Please try again.';

      emitToast(message, 'error');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
