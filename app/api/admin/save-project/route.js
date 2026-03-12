import { put, list } from '@vercel/blob';
import projectsDataFallback from '@/lib/projects-data.json';

const BLOB_PATH = 'admin/projects-data.json';

async function readProjectsData() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) return await res.json();
    }
  } catch (_) {}
  // Fall back to the bundled JSON (first run or local dev)
  return JSON.parse(JSON.stringify(projectsDataFallback));
}

export async function POST(request) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (body.isAuthCheck) return Response.json({ ok: true });
    const { slug, projectData, isDelete } = body;

    const data = await readProjectsData();

    if (isDelete) {
      delete data.projects[slug];
      data.featuredSlugs = data.featuredSlugs.filter(s => s !== slug);
    } else {
      data.projects[slug] = { ...projectData, slug };
    }

    await put(BLOB_PATH, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
