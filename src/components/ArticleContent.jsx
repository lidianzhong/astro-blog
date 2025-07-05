import { useEffect, useState } from 'react';

const CACHE_PREFIX = 'article_cache_';
const CACHE_EXPIRE = 5 * 60 * 1000; // 5分钟

function getCache(id) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    if (!raw) return null;
    const { data, time } = JSON.parse(raw);
    if (Date.now() - time > CACHE_EXPIRE) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(id, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + id,
      JSON.stringify({ data, time: Date.now() })
    );
  } catch {}
}

export default function ArticleContent({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 尝试从缓存中获取数据
    const cached = getCache(id);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    // 如果缓存不存在，则从API加载数据
    fetch(`/api/blog/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('加载失败');
        return res.json();
      })
      .then(d => {
        setData(d);
        setCache(id, d);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>文章加载失败</div>;
  if (!data) return null;

  return (
    <article className="article-layout">
      <h1>{data.title}</h1>
      <p className="date">{data.date}</p>
      {data.updatedAt && <p className="updated-at">Updated at: {data.updatedAt}</p>}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: data.content }}></div>
    </article>
  );
}