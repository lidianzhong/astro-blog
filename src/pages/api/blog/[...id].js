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

import fs from 'fs/promises';
import path from 'path';

export async function POST({ params, request }) {
  const { id } = params;
  const body = await request.json();

  // 解析 id，支持多级路径
  const idPath = Array.isArray(id) ? id.join('/') : id;
  const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${idPath}.md`);

  // 构建 frontmatter 和内容
  const { title, date, updatedAt, content } = body;
  const frontmatter = [
    '---',
    `title: "${title || ''}"`,
    `date: "${date || new Date().toISOString()}"`,
    updatedAt ? `updatedAt: "${updatedAt}"` : null,
    '---'
  ].filter(Boolean).join('\n');

  const fileContent = `${frontmatter}\n\n${content || ''}`;

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fileContent, 'utf-8');
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}