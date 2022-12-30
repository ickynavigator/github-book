import { router } from '../trpc';
import { githubRouter } from './github';

export const appRouter = router({
  github: githubRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
