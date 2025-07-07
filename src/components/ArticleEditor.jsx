import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function ArticleEditor({ id }) {
  const [initialContent, setInitialContent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [saving, setSaving] = useState(false);

  // 拉取文章内容
  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('加载失败'))
      .then(data => {
        setInitialContent(data.content || '');
        setTitle(data.title || '');
        setDate(data.date || '');
        setUpdatedAt(data.updatedAt || '');
      })
      .catch(() => {
        setInitialContent('');
        setTitle('');
        setDate('');
        setUpdatedAt('');
      });
  }, [id]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: { attributes: {} },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    const content = editor.getHTML();
    await fetch(`/api/blog/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        date,
        updatedAt: new Date().toISOString(),
        content,
      }),
    });

    // 清除侧边栏的缓存以触发重新加载
    try {
      const category = id.split('/')[0];
      localStorage.removeItem('category_sidebar_cache_' + category);
    } catch {}

    // 清除文章内容的缓存以触发重新加载
    try {
      localStorage.removeItem('article_cache_' + id);
    } catch {}

    setSaving(false);
  };

  if (!editor) return <div>加载编辑器...</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="标题"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <input
        type="date"
        value={date ? date.slice(0, 10) : ''}
        onChange={e => setDate(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <EditorContent editor={editor} />
      <button onClick={handleSave} disabled={saving}>
        {saving ? '保存中...' : '保存'}
      </button>
    </div>
  );
}