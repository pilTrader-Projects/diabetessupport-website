'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for TipTap WYSIWYG editor to avoid SSR window/document mismatch issues
const WysiwygEditor = dynamic(() => import('@/components/WysiwygEditor'), {
  ssr: false,
  loading: () => <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl text-slate-400 text-sm">Loading WYSIWYG Editor...</div>,
});

interface Post {
  _id: string;
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  category?: string;
  status: 'published' | 'draft';
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/v1/posts?limit=100');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch {
      console.error('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setCategory('General');
    setStatus('published');
    setExcerpt('');
    setFeaturedImage('');
    setContent('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        setEditingPostId(p._id);
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setCategory(p.category || 'General');
        setStatus(p.status || 'published');
        setExcerpt(p.excerpt || '');
        setFeaturedImage(p.featuredImage || '');
        setContent(p.content || '');
        setIsModalOpen(true);
      } else {
        alert(data.error || 'Failed to load post details.');
      }
    } catch {
      alert('Error fetching post details.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Article title is required.');
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim(),
      status,
      excerpt: excerpt.trim(),
      featuredImage: featuredImage.trim() || undefined,
      content,
    };

    try {
      let res: Response;
      if (editingPostId) {
        res = await fetch(`/api/v1/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/v1/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPosts();
      } else {
        alert(data.error || 'Failed to save article.');
      }
    } catch {
      alert('Network error saving article.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) return;

    try {
      const res = await fetch(`/api/v1/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter((p) => p._id !== id));
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch {
      alert('Network error deleting post.');
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
            <Link href="/admin" className="hover:text-teal-400">Admin Dashboard</Link>
            <span>/</span>
            <span className="text-teal-400">Blog Articles</span>
          </div>
          <h1 className="text-3xl font-black text-white">Blog Article CMS</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleOpenCreate}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Create Article
          </button>
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading blog articles...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <span className="text-4xl">📚</span>
          <h3 className="text-xl font-bold text-white">No Articles Found</h3>
          <p className="text-sm text-slate-400">Create a new article using the button above or use the automated publishing API.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPosts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-6 py-4">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-teal-400 flex items-center gap-1.5"
                    >
                      <span>{post.title.replace(/&nbsp;/g, ' ')}</span>
                      <span className="text-xs text-slate-500">↗</span>
                    </a>
                    {post.excerpt && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{post.excerpt}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-teal-950 text-teal-300 text-xs font-bold px-2.5 py-1 rounded-md border border-teal-800">
                      {post.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        post.status === 'published'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(post._id)}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-800/80 transition-colors cursor-pointer"
                    >
                      Edit (WYSIWYG)
                    </button>
                    <button
                      onClick={() => handleDelete(post._id, post.title)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-900/60 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WYSIWYG Article Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full my-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  {editingPostId ? 'Edit Article' : 'New Article'}
                </span>
                <h2 className="text-2xl font-black text-white">
                  {editingPostId ? 'WYSIWYG Article Editor' : 'Create New Article'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Understanding HbA1c Target Levels"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. understanding-hba1c-target-levels"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category, Status & Featured Image */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    placeholder="e.g. Educational Guides, Prevention, General"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <datalist id="category-suggestions">
                    <option value="General" />
                    <option value="Educational Guides" />
                    <option value="Insulin Resistance" />
                    <option value="Prevention" />
                    <option value="Diet & Nutrition" />
                    {Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  Short Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence overview for search previews..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* WYSIWYG Content Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  Article Body Content (WYSIWYG Editor)
                </label>
                <WysiwygEditor
                  key={editingPostId || 'new_post_editor'}
                  content={content}
                  onChange={(html) => setContent(html)}
                  placeholder="Write or paste your article content here with formatting, headings, and images..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPostId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
