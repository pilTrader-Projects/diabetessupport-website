'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Post {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  status: 'published' | 'draft';
  publishedAt?: string;
  createdAt: string;
}

/**
 * Owner Admin Blog Post CMS Management Page (/admin/posts).
 *
 * @usecase Visual management interface for editing, creating, publishing, drafting, and deleting blog posts.
 * @returns {JSX.Element} Rendered CMS article directory and management controls.
 */
export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading blog articles...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <span className="text-4xl">📚</span>
          <h3 className="text-xl font-bold text-white">No Articles Found</h3>
          <p className="text-sm text-slate-400">Use the publishing API or WordPress migration script to import articles.</p>
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
    </div>
  );
}
