import type { KnowledgeBase } from './types';
import { AppError } from './errors';

export interface GitHubConfig {
  pat: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

export interface GitHubFetchResult<T = KnowledgeBase> {
  content: T;
  sha: string;
}

interface GitHubContentsResponse {
  content: string;
  sha: string;
}

interface GitHubPutResponse {
  content: { sha: string };
}

async function ghFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  return res;
}

export async function fetchGitHubFile<T>(config: GitHubConfig): Promise<GitHubFetchResult<T>> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`;
  const res = await ghFetch(url, {
    headers: {
      Authorization: `Bearer ${config.pat}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  });
  if (res.status === 404) throw new AppError('FILE_NOT_FOUND', 404);
  if (!res.ok) throw new AppError(`GitHub error: ${res.status}`, res.status);
  const data = (await res.json()) as GitHubContentsResponse;
  const content = JSON.parse(
    Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8'),
  ) as T;
  return { content, sha: data.sha };
}

export async function saveGitHubFile<T>(
  config: GitHubConfig,
  sha: string,
  content: T,
  message: string,
): Promise<string> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
  const res = await ghFetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      ...(sha ? { sha } : {}), // yeni dosya oluştururken sha olmayabilir
      branch: config.branch,
    }),
  });
  if (res.status === 409) throw new AppError('CONFLICT', 409);
  if (!res.ok) throw new AppError(`Save error: ${res.status}`, res.status);
  const data = (await res.json()) as GitHubPutResponse;
  return data.content.sha;
}

// Geriye dönük uyumluluk
export const fetchKnowledgeBase = (config: GitHubConfig) =>
  fetchGitHubFile<KnowledgeBase>(config);

export const saveKnowledgeBase = (
  config: GitHubConfig,
  sha: string,
  content: KnowledgeBase,
  message: string,
) => saveGitHubFile(config, sha, content, message);
