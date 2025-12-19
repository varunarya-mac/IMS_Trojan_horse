/**
 * React Query Client Configuration
 */

import { QueryClient } from '@tanstack/react-query';
import { STALE_TIME } from '@constants/ui';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME.MEDIUM,
      refetchOnWindowFocus: false,
    },
  },
});
