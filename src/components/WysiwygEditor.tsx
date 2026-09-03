'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

export interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Rich Text WYSIWYG Editor Component using TipTap.
 *
 * @usecase Visual HTML content creation and editing for blog articles in the admin dashboard.
 * @param {WysiwygEditorProps} props Component props containing initial content, onChange handler, and placeholder.
 * @returns {JSX.Element} Rendered editor with formatting toolbar.
 */
export default function WysiwygEditor({
  content,
  onChange,
  placeholder = 'Write your article content here...',
}: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-teal-400 underline font-semibold',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-4 border border-slate-700 shadow-md',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[300px] p-4 sm:p-6 focus:outline-none text-slate-100 text-base leading-relaxed',
      },
    },
  });

  if (!editor) {
    return <div className="p-4 text-slate-500 text-sm">Loading editor...</div>;
  }

  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Link URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-700 bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
      {/* Formatting Toolbar */}
      <div className="bg-slate-950 p-2 sm:p-3 border-b border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            editor.isActive('bold')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-lg italic font-serif transition-colors ${
            editor.isActive('italic')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          I
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1.5 rounded-lg line-through transition-colors ${
            editor.isActive('strike')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          S
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded-lg font-extrabold transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          H2
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          H3
        </button>

        {/* Paragraph */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            editor.isActive('paragraph')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          P
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          • List
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          1. List
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          ” Quote
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            editor.isActive('link')
              ? 'bg-teal-500 text-slate-950'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750'
          }`}
        >
          🔗 Link
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 transition-colors"
        >
          📷 Image
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-200 border border-slate-750 transition-colors"
        >
          ↩ Undo
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-200 border border-slate-750 transition-colors"
        >
          ↪ Redo
        </button>
      </div>

      {/* Editor Content Box */}
      <EditorContent editor={editor} />
    </div>
  );
}
