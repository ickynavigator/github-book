import { z } from 'zod';
import { buildFileTree, fetchGithubRepoContent } from '../../../utils/github';

import { publicProcedure, router } from '../trpc';

export const githubRouter = router({
  fetchContents: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        fileTypes: z.string().optional(),
        hideDirs: z.boolean().optional(),
        path: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const res = await fetchGithubRepoContent(input);
      const tree = buildFileTree(res.data, input.fileTypes, input.hideDirs);

      return tree;
    }),
});
