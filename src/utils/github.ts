import { Octokit } from '@octokit/core';
import { env } from '../env/server.mjs';

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

type OctokitWrapperReturnType<T> = T extends (
  ...args: never
) => Promise<infer R>
  ? R
  : never;

interface FileStruct {
  [x: string]: {
    files: string[];
    dirs?: string[];
  };
}

export const fetchGithubRepoContent = async ({
  owner,
  repo,
  path = '',
}: {
  owner: string;
  repo: string;
  path?: string;
}) => {
  const githubOptions = { owner, repo, path };

  const {
    data: {
      commit: { sha },
    },
  } = await octokit.request(
    'GET /repos/{owner}/{repo}/branches/master',
    githubOptions,
  );

  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
    { ...githubOptions, tree_sha: sha, recursive: 'true' },
  );

  return response;
};

export const buildFileTree = (
  data: OctokitWrapperReturnType<typeof fetchGithubRepoContent>['data'],
  fileTypeRestriction?: string,
  hideDirs = false,
) => {
  const tree = data.tree.reduce((acc, item) => {
    const { path, type } = item;

    const pathParts = (path as string)?.split('/');
    const fileName = pathParts.pop() as string;
    const dirPath = pathParts.join('/');
    const dir = acc[dirPath] || (acc[dirPath] = { files: [], dirs: [] });

    if (type === 'blob') {
      if (fileTypeRestriction) {
        const fileTypes = fileTypeRestriction
          .split(',')
          .map(type => type.trim())
          .map(type => type.replace(/^\./, ''));
        const fileType = fileName.split('.').pop();

        if (!fileType || !fileTypes.includes(fileType)) {
          return acc;
        }
      }

      dir.files.push(fileName);
    } else if (type === 'tree') {
      dir.dirs?.push(fileName);
    }

    return acc;
  }, {} as FileStruct);

  Object.keys(tree).forEach(key => {
    if (tree[key]?.files.length === 0) {
      delete tree[key];
    }
  });

  if (hideDirs) {
    Object.keys(tree).forEach(key => {
      delete tree[key]?.dirs;
    });
  }

  return tree;
};
