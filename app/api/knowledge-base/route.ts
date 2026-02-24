import { fetchKnowledgeBase, saveKnowledgeBase } from '@/lib/github';
import type { KnowledgeBase } from '@/lib/types';
import { toAppError } from '@/lib/errors';

const config = {
  pat: process.env.GITHUB_PAT ?? '',
  owner: process.env.GITHUB_OWNER ?? '',
  repo: process.env.GITHUB_REPO ?? '',
  branch: process.env.GITHUB_BRANCH ?? 'main',
  filePath: process.env.GITHUB_FILE_PATH ?? 'knowledge_base.json',
};

interface PostBody {
  content: KnowledgeBase;
  message: string;
}

function isPostBody(v: unknown): v is PostBody {
  return (
    typeof v === 'object' &&
    v !== null &&
    'content' in v &&
    'message' in v &&
    typeof (v as Record<string, unknown>).message === 'string'
  );
}

const ok = () => Boolean(config.pat && config.owner && config.repo);

export async function GET() {
  if (!ok()) return Response.json({ error: 'GitHub config missing' }, { status: 503 });
  try {
    const { content } = await fetchKnowledgeBase(config);
    return Response.json(content, {
      headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    const err = toAppError(e);
    return Response.json({ error: err.message }, { status: err.status });
  }
}

export async function POST(req: Request) {
  if (!ok()) return Response.json({ error: 'GitHub config missing' }, { status: 503 });
  try {
    const body: unknown = await req.json();
    if (!isPostBody(body)) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const current = await fetchKnowledgeBase(config);
    const sha = await saveKnowledgeBase(config, current.sha, body.content, body.message);
    return Response.json({ sha });
  } catch (e) {
    const err = toAppError(e);
    return Response.json({ error: err.message }, { status: err.status });
  }
}
