import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function ArticleEditor({ id }) {
  const [initialContent, setInitialContent] = useState('');
  const [saving, setSaving] = useState(false);

  // 拉取文章内容
  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('加载失败'))
      .then(data => setInitialContent(data.content || ''))
      .catch(() => setInitialContent(''));
  }, [id]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: { attributes: {} },
    immediatelyRender: false,
  });

  // 关键：内容变化时同步到编辑器
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
      body: JSON.stringify({ content }),
    });
    setSaving(false);
  };

  if (!editor) return <div>加载编辑器...</div>;

  return (
    <div>
      <EditorContent editor={editor} />
      <button onClick={handleSave} disabled={saving}>
        {saving ? '保存中...' : '保存'}
      </button>
    </div>
  );
}