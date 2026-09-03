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
 * Rich Text WYSIWYG Editor Component using TipTap with Marketing Embed Controls.
 *
 * @usecase Visual HTML content creation and editing for blog articles in the admin dashboard with direct insertion of marketing lead capture forms.
 * @param {WysiwygEditorProps} props Component props containing initial content, onChange handler, and placeholder.
 * @returns {JSX.Element} Rendered editor with formatting and marketing widget toolbar.
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
          'prose prose-invert max-w-none min-h-[320px] p-4 sm:p-6 focus:outline-none text-slate-100 text-base leading-relaxed',
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

  // Marketing Widget Embed Tools
  const insertKitOptIn = () => {
    const title =
      window.prompt('Enter Lead Form Title:', 'Get Our Free Diabetes Care & Health Guide') ||
      'Get Our Free Diabetes Care & Health Guide';
    const buttonText = window.prompt('Enter Button Text:', 'Subscribe Free') || 'Subscribe Free';

    editor
      .chain()
      .focus()
      .insertContent(
        `<div data-widget="kit-optin" data-title="${title}" data-button="${buttonText}" data-layout="card" class="my-6 p-6 bg-teal-950/80 border border-teal-600 rounded-2xl text-teal-200 font-bold text-center">📩 [MARKETING WIDGET: Lead Capture Form - "${title}"]</div><p></p>`
      )
      .run();
  };

  const insertLeadMagnetCard = () => {
    const title =
      window.prompt(
        'Enter Lead Magnet Title:',
        'Download The Free 7-Day Diabetes Action Plan & Cheatsheet'
      ) || 'Download The Free 7-Day Diabetes Action Plan & Cheatsheet';

    editor
      .chain()
      .focus()
      .insertContent(
        `<div data-widget="lead-magnet" data-title="${title}" class="my-6 p-6 bg-slate-950/90 border border-amber-500 rounded-2xl text-amber-300 font-bold text-center">📑 [MARKETING WIDGET: Lead Magnet PDF Card - "${title}"]</div><p></p>`
      )
      .run();
  };

  const insertKitEmbed = () => {
    const url = window.prompt(
      'Enter Kit Form/Landing Page URL (or Script URL):',
      'https://glycosense.kit.com/1d0f3e3530'
    );
    if (!url) return;

    editor
      .chain()
      .focus()
      .insertContent(
        `<div data-widget="kit-embed" data-url="${url}" class="my-6 p-6 bg-slate-950/90 border border-teal-500 rounded-2xl text-teal-300 font-bold text-center">🌐 [MARKETING WIDGET: Kit Script/Page Embed - "${url}"]</div><p></p>`
      )
      .run();
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

        {/* Marketing Embed Tools */}
        <div className="flex items-center gap-1 bg-teal-950/60 p-1 rounded-xl border border-teal-800/80">
          <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest px-1">
            Marketing:
          </span>
          <button
            type="button"
            onClick={insertKitOptIn}
            className="px-2.5 py-1 rounded-lg bg-teal-900 hover:bg-teal-800 text-teal-200 font-bold transition-colors cursor-pointer"
            title="Insert Lead Capture Opt-In Form"
          >
            📩 Lead Form
          </button>
          <button
            type="button"
            onClick={insertLeadMagnetCard}
            className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold transition-colors cursor-pointer border border-amber-800/50"
            title="Insert PDF Lead Magnet Card"
          >
            📑 PDF Magnet
          </button>
          <button
            type="button"
            onClick={insertKitEmbed}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
            title="Insert External Kit Landing Page / Script Embed"
          >
            🌐 Kit Embed
          </button>
        </div>

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
