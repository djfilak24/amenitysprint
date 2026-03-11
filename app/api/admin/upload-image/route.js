import { put } from '@vercel/blob';

export async function POST(request) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) return Response.json({ error: 'No file' }, { status: 400 });
  const blob = await put(file.name, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
