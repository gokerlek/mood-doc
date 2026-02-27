import { fetchGitHubFile, saveGitHubFile } from '@/lib/github';
import type { KnowledgeBase, MapNodeData, MapEdgeData } from '@/lib/types';
import { toAppError } from '@/lib/errors';

// Map verisi knowledge_base.json içinde "map" alanında yaşar
const config = {
  pat: process.env.GITHUB_PAT ?? '',
  owner: process.env.GITHUB_OWNER ?? '',
  repo: process.env.GITHUB_REPO ?? '',
  branch: process.env.GITHUB_BRANCH ?? 'main',
  filePath: process.env.GITHUB_FILE_PATH ?? 'knowledge_base.json',
};

const ok = () => Boolean(config.pat && config.owner && config.repo);

export async function GET() {
  if (!ok()) return Response.json({ error: 'GitHub config missing' }, { status: 503 });
  try {
    const { content } = await fetchGitHubFile<KnowledgeBase>(config);
    return Response.json(
      { nodes: content.map?.nodes ?? [], edges: content.map?.edges ?? [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    const err = toAppError(e);
    if (err.status === 404) {
      return Response.json({ nodes: [], edges: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return Response.json({ error: err.message }, { status: err.status });
  }
}

interface PostBody {
  nodes: MapNodeData[];
  edges: MapEdgeData[];
  message?: string;
}

function isPostBody(v: unknown): v is PostBody {
  return typeof v === 'object' && v !== null && 'nodes' in v && 'edges' in v;
}

export async function POST(req: Request) {
  if (!ok()) return Response.json({ error: 'GitHub config missing' }, { status: 503 });
  try {
    const body: unknown = await req.json();
    if (!isPostBody(body)) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }
    // Her zaman güncel sha ile kaydet — SSS/Sözlük/Kurallar ile çakışma olmaz
    const { content, sha } = await fetchGitHubFile<KnowledgeBase>(config);
    const updated: KnowledgeBase = {
      ...content,
      map: { nodes: body.nodes, edges: body.edges },
    };
    await saveGitHubFile(config, sha, updated, body.message ?? 'Update map');
    return Response.json({ ok: true });
  } catch (e) {
    const err = toAppError(e);
    return Response.json({ error: err.message }, { status: err.status });
  }
}
