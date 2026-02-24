// Deprecated - this sub-route is no longer used in v2
// All KB access goes through /api/knowledge-base (GET/POST)
export async function GET() {
  return Response.json({ error: 'Endpoint deprecated. Use /api/knowledge-base instead.' }, { status: 410 });
}
