export const prerender = false;

import { getCollection } from 'astro:content';

export async function GET({ url, request }) {
  const category = url.searchParams.get('category');
  const articles = await getCollection('blog', (article) => {
    const article_category = article.id.split('/')[0];
    return article_category === category;
  });

  // 计算etag：用所有文章的更新时间拼接
  const etag = articles
    .map(a => (a.data.updatedAt || a.data.date).toISOString())
    .join(',');

  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  const categorySidebarInfo = articles.map((article) => ({
    id: article.id,
    title: article.data.title,
    date: article.data.date.toLocaleDateString(),
  }));

  return new Response(JSON.stringify(categorySidebarInfo), {
    headers: {
      'Content-Type': 'application/json',
      'ETag': etag,
    },
  });
}