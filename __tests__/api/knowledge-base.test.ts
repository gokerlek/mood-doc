import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { KnowledgeBase } from '@/lib/types';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return {
    json: async () => body,
  } as unknown as Request;
}

const fakeKB: KnowledgeBase = {
  _meta: { schema_version: '3.0', last_updated: '2024-01-01T00:00:00.000Z' },
  tag_categories: [],
  tags: [],
  components: [],
  map: { nodes: [], edges: [] },
  faq: [],
  rules: [],
  glossary: [],
  agent_behavior: {
    tone: 'friendly',
    fallback_message: '',
    escalation_message: '',
    max_answer_sentences: 3,
    escalation_triggers: [],
  },
};

// ─── GET: config present ─────────────────────────────────────────────────────

describe('GET handler (config present)', () => {
  let GET: (typeof import('@/app/api/knowledge-base/route'))['GET'];
  let mockFetch: ReturnType<typeof vi.fn>;
  let AppError: typeof import('@/lib/errors').AppError;

  beforeAll(async () => {
    vi.resetModules();

    process.env.GITHUB_PAT = 'test-pat';
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';
    process.env.GITHUB_BRANCH = 'main';
    process.env.GITHUB_FILE_PATH = 'knowledge_base.json';

    mockFetch = vi.fn();

    vi.doMock('@/lib/github', () => ({
      fetchKnowledgeBase: mockFetch,
      saveKnowledgeBase: vi.fn(),
    }));
    vi.doMock('@/lib/defaults', () => ({
      emptyKnowledgeBase: vi.fn(() => ({ _meta: { schema_version: '3.0' }, _empty: true })),
    }));

    // Import AppError from the same module instance the route will use
    AppError = (await import('@/lib/errors')).AppError;
    const mod = await import('@/app/api/knowledge-base/route');
    GET = mod.GET;
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns content from fetchKnowledgeBase with correct headers', async () => {
    mockFetch.mockResolvedValue({ content: fakeKB, sha: 'abc123' });

    const res = await GET();
    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(body).toEqual(fakeKB);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.status).toBe(200);
  });

  it('returns AppError status and message when fetchKnowledgeBase throws AppError', async () => {
    mockFetch.mockRejectedValue(new AppError('FILE_NOT_FOUND', 404));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ error: 'FILE_NOT_FOUND' });
  });

  it('returns 500 when fetchKnowledgeBase throws a generic Error', async () => {
    mockFetch.mockRejectedValue(new Error('network failure'));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'network failure' });
  });
});

// ─── POST: config present ────────────────────────────────────────────────────

describe('POST handler (config present)', () => {
  let POST: (typeof import('@/app/api/knowledge-base/route'))['POST'];
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockSave: ReturnType<typeof vi.fn>;
  let AppError: typeof import('@/lib/errors').AppError;

  beforeAll(async () => {
    vi.resetModules();

    process.env.GITHUB_PAT = 'test-pat';
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';
    process.env.GITHUB_BRANCH = 'main';
    process.env.GITHUB_FILE_PATH = 'knowledge_base.json';

    mockFetch = vi.fn();
    mockSave = vi.fn();

    vi.doMock('@/lib/github', () => ({
      fetchKnowledgeBase: mockFetch,
      saveKnowledgeBase: mockSave,
    }));
    vi.doMock('@/lib/defaults', () => ({
      emptyKnowledgeBase: vi.fn(() => ({ _meta: { schema_version: '3.0' }, _empty: true })),
    }));

    // Import AppError from the same module instance the route will use
    AppError = (await import('@/lib/errors')).AppError;
    const mod = await import('@/app/api/knowledge-base/route');
    POST = mod.POST;
  });

  beforeEach(() => {
    mockFetch.mockReset();
    mockSave.mockReset();
  });

  it('returns sha on success', async () => {
    mockFetch.mockResolvedValue({ content: fakeKB, sha: 'old-sha' });
    mockSave.mockResolvedValue('new-sha-xyz');

    const req = makeRequest({ content: fakeKB, message: 'update knowledge base' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ sha: 'new-sha-xyz' });
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ pat: 'test-pat', owner: 'test-owner', repo: 'test-repo' }),
      'old-sha',
      fakeKB,
      'update knowledge base',
    );
  });

  it('returns 400 when body has no message field', async () => {
    const req = makeRequest({ content: fakeKB });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid request body' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when body is null', async () => {
    const req = makeRequest(null);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid request body' });
  });

  it('returns 400 when body is a plain string (not an object)', async () => {
    const req = makeRequest('just a string');
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid request body' });
  });

  it('returns 400 when message field is not a string', async () => {
    const req = makeRequest({ content: fakeKB, message: 42 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid request body' });
  });

  it('returns error when saveKnowledgeBase throws AppError (e.g. 409 conflict)', async () => {
    mockFetch.mockResolvedValue({ content: fakeKB, sha: 'sha-1' });
    mockSave.mockRejectedValue(new AppError('CONFLICT', 409));

    const req = makeRequest({ content: fakeKB, message: 'update' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body).toEqual({ error: 'CONFLICT' });
  });

  it('returns 500 when saveKnowledgeBase throws a generic Error', async () => {
    mockFetch.mockResolvedValue({ content: fakeKB, sha: 'sha-1' });
    mockSave.mockRejectedValue(new Error('unexpected failure'));

    const req = makeRequest({ content: fakeKB, message: 'update' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'unexpected failure' });
  });
});

// ─── Config missing (no env vars) ───────────────────────────────────────────

describe('when GitHub config is missing', () => {
  let GET_no_config: (typeof import('@/app/api/knowledge-base/route'))['GET'];
  let POST_no_config: (typeof import('@/app/api/knowledge-base/route'))['POST'];

  beforeAll(async () => {
    vi.resetModules();

    delete process.env.GITHUB_PAT;
    delete process.env.GITHUB_OWNER;
    delete process.env.GITHUB_REPO;

    vi.doMock('@/lib/github', () => ({
      fetchKnowledgeBase: vi.fn(),
      saveKnowledgeBase: vi.fn(),
    }));
    vi.doMock('@/lib/defaults', () => ({
      emptyKnowledgeBase: vi.fn(() => ({ _meta: { schema_version: '3.0' }, _empty: true })),
    }));

    const mod = await import('@/app/api/knowledge-base/route');
    GET_no_config = mod.GET;
    POST_no_config = mod.POST;
  });

  it('GET returns empty KB (200) with correct headers when config is missing', async () => {
    const res = await GET_no_config();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ _meta: { schema_version: '3.0' } });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('POST returns 503 when config is missing', async () => {
    const req = makeRequest({ content: fakeKB, message: 'update' });
    const res = await POST_no_config(req);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body).toEqual({ error: 'GitHub config missing' });
  });
});
