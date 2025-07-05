import { useEffect, useState } from 'react';

const CACHE_PREFIX = 'category_sidebar_cache_';
const CACHE_EXPIRE = 5 * 60 * 1000; // 5分钟

function getCache(category) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + category);
    if (!raw) return null;
    const { data, time } = JSON.parse(raw);
    if (Date.now() - time > CACHE_EXPIRE) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(category, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + category,
      JSON.stringify({ data, time: Date.now() })
    );
  } catch {}
}

export default function CategorySidebarContent({ category }) {
  const [articles, setArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = getCache(category);
    if (cached) {
      setArticles(cached);
      setLoading(false);
      return;
    }
    fetch(`/api/category?category=${encodeURIComponent(category)}`)
      .then(res => {
        if (!res.ok) throw new Error('加载失败');
        return res.json();
      })
      .then(data => {
        setArticles(data);
        setCache(category, data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>侧边栏加载失败</div>;
  if (!articles) return null;

  return (
    <aside className="category-sidebar">
      <div className="articles-list">
        {articles.map(article => {
          const [cat, slug] = article.id.split('/');
          const url = `/blog/${cat}/${slug}`;
          return (
            <a
              className="article-item"
              href={url}
              style={{ cursor: 'pointer', display: 'block', textDecoration: 'none' }}
              key={article.id}
            >
              <h3>{article.title}</h3>
              <p className="article-date">{article.date}</p>
            </a>
          );
        })}
      </div>
    </aside>
  );
}