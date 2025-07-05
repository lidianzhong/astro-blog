export const prerender = false;

import { getEntry } from 'astro:content';

export async function GET({ params, request }) {
  const { id } = params;
  const entry = await getEntry('blog', id);
  if (!entry) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  const etag = (entry.data.updatedAt || entry.data.date).toISOString();
  const ifNoneMatch = request.headers.get('if-none-match');

  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  /*
  ==> response example:
  {
  "title": "how to learn c++",
  "date": "2024-06-01T00:00:00.000Z",
  "updatedAt": "2024-06-02T00:00:00.000Z", (optional)
  "content": "# 1. Practice ...",
  }
  */
  return new Response(JSON.stringify({
    ...entry.data,
    content: entry.body,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'ETag': etag
    }
  });
}