import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (body.isAuthCheck) return Response.json({ ok: true });
    const { slug, projectData, isDelete } = body;
    const dataPath = path.join(process.cwd(), 'lib', 'projects-data.json');
    const raw = await readFile(dataPath, 'utf8');
    const data = JSON.parse(raw);

    if (isDelete) {
      delete data.projects[slug];
      // Also remove from featuredSlugs
      data.featuredSlugs = data.featuredSlugs.filter(s => s !== slug);
    } else {
      data.projects[slug] = { ...projectData, slug };
    }

    await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
