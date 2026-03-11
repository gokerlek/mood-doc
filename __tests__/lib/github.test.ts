import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGitHubFile, saveGitHubFile } from '@/lib/github';
import { AppError } from '@/lib/errors';

const config = {
  pat: 'test-pat',
  owner: 'test-owner',
  repo: 'test-repo',
  branch: 'main',
  filePath: 'knowledge_base.json',
};

// Helper to create a base64-encoded JSON response body
function makeBase64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

function makeFetchResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('fetchGitHubFile', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns parsed content and sha on success', async () => {
    const payload = { hello: 'world' };
    const encoded = makeBase64(payload);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: encoded, sha: 'abc123' })
    ));

    const result = await fetchGitHubFile<typeof payload>(config);
    expect(result.content).toEqual(payload);
    expect(result.sha).toBe('abc123');
  });

  it('throws AppError with status 404 when file not found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(404, {})));
    await expect(fetchGitHubFile(config)).rejects.toThrow(AppError);
    await expect(fetchGitHubFile(config)).rejects.toMatchObject({ status: 404, message: 'FILE_NOT_FOUND' });
  });

  it('throws AppError for other non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(500, {})));
    await expect(fetchGitHubFile(config)).rejects.toMatchObject({ status: 500 });
  });

  it('sends Authorization header with Bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: makeBase64({}), sha: 'sha1' })
    );
    vi.stubGlobal('fetch', fetchMock);
    await fetchGitHubFile(config);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer test-pat');
  });

  it('constructs correct URL with owner, repo, filePath, branch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: makeBase64({}), sha: 'sha1' })
    );
    vi.stubGlobal('fetch', fetchMock);
    await fetchGitHubFile(config);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('https://api.github.com/repos/test-owner/test-repo/contents/knowledge_base.json?ref=main');
  });
});

describe('saveGitHubFile', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns new sha on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: { sha: 'new-sha-456' } })
    ));
    const sha = await saveGitHubFile(config, 'old-sha', { data: 1 }, 'update kb');
    expect(sha).toBe('new-sha-456');
  });

  it('throws AppError with status 409 on conflict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(409, {})));
    await expect(saveGitHubFile(config, 'sha', {}, 'msg')).rejects.toMatchObject({ status: 409, message: 'CONFLICT' });
  });

  it('throws AppError for other non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(503, {})));
    await expect(saveGitHubFile(config, 'sha', {}, 'msg')).rejects.toMatchObject({ status: 503 });
  });

  it('sends PUT method', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: { sha: 'x' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    await saveGitHubFile(config, 'sha', {}, 'msg');
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe('PUT');
  });

  it('includes sha in request body when sha provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: { sha: 'x' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    await saveGitHubFile(config, 'existing-sha', { key: 'val' }, 'commit msg');
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as Record<string, string>;
    expect(body.sha).toBe('existing-sha');
    expect(body.message).toBe('commit msg');
    expect(body.branch).toBe('main');
  });

  it('base64-encodes content in request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeFetchResponse(200, { content: { sha: 'x' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    const data = { hello: 'world' };
    await saveGitHubFile(config, 'sha', data, 'msg');
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as { content: string };
    const decoded: unknown = JSON.parse(Buffer.from(body.content, 'base64').toString('utf-8'));
    expect(decoded).toEqual(data);
  });
});
