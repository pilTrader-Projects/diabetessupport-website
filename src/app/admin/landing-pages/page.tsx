'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface LandingPage {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  kitFormId?: string;
  kitScriptUrl?: string;
  embedType: 'script' | 'iframe' | 'hosted';
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Owner Admin Kit Landing Pages CMS Management Page (/admin/landing-pages).
 *
 * @usecase Visual management dashboard for mapping custom URL slugs to Kit (ConvertKit) script/form embeds.
 * @returns {JSX.Element} Rendered CMS management table and form.
 */
export default function AdminLandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [kitScriptUrl, setKitScriptUrl] = useState('');
  const [kitFormId, setKitFormId] = useState('');
  const [embedType, setEmbedType] = useState<'script' | 'iframe' | 'hosted'>('script');
  const [metaTitle, setMetaTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLandingPages = async () => {
    try {
      const res = await fetch('/api/v1/landing-pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.data || []);
      }
    } catch {
      console.error('Failed to load landing pages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          kitScriptUrl,
          kitFormId,
          embedType,
          metaTitle,
          isActive: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to create landing page.');
      } else {
        setSuccessMsg(`Successfully created landing page at /${data.data.slug}!`);
        setShowModal(false);
        // Reset Form
        setTitle('');
        setSlug('');
        setDescription('');
        setKitScriptUrl('');
        setKitFormId('');
        fetchLandingPages();
      }
    } catch {
      setErrorMsg('Network error. Please check admin login status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, pageSlug: string) => {
    if (!confirm(`Are you sure you want to delete /${pageSlug}?`)) return;

    try {
      const res = await fetch(`/api/v1/landing-pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPages(pages.filter((p) => p._id !== id));
      } else {
        alert(data.error || 'Failed to delete landing page.');
      }
    } catch {
      alert('Network error deleting page.');
    }
  };

  const handleToggleStatus = async (page: LandingPage) => {
    try {
      const res = await fetch(`/api/v1/landing-pages/${page._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !page.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPages(pages.map((p) => (p._id === page._id ? { ...p, isActive: !p.isActive } : p)));
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
            <Link href="/admin" className="hover:text-teal-400">Admin Dashboard</Link>
            <span>/</span>
            <span className="text-teal-400">Kit Landing Pages</span>
          </div>
          <h1 className="text-3xl font-black text-white">Kit Landing Pages & Custom Slugs</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>+ Add New Kit Slug Mapping</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-teal-950/80 border border-teal-700 rounded-xl text-xs font-bold text-teal-300">
          ✅ {successMsg}
        </div>
      )}

      {/* Pages Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading custom landing pages...</div>
      ) : pages.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <span className="text-4xl">📄</span>
          <h3 className="text-xl font-bold text-white">No Custom Kit Slugs Added Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Click the button below to map your first Kit (ConvertKit) form or script to a custom slug like <code className="text-teal-300">/subscribe</code>.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            + Create Your First Kit Slug Mapping
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Embed Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pages.map((page) => (
                <tr key={page._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-teal-400">
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>/{page.slug}</span>
                      <span className="text-xs text-slate-500">↗</span>
                    </a>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{page.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700">
                      {page.embedType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(page)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                        page.isActive
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {page.isActive ? 'Active ●' : 'Inactive ○'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(page._id, page.slug)}
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

      {/* Create Landing Page Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Add Kit Landing Page Slug</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs font-semibold text-rose-300">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Target URL Slug <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-950 px-3 py-3 rounded-l-xl border border-r-0 border-slate-700 text-slate-500 font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. subscribe or cheatsheet"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-r-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Page Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free 7-Day Diabetes Action Plan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional paragraph description displayed above the form..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Kit Script Tag Embed, Script URL, or Form Share URL
                </label>
                <textarea
                  rows={3}
                  placeholder={`Paste raw Kit script tag snippet (e.g. <script async data-uid="1d0f3e3530" src="https://glycosense.kit.com/1d0f3e3530/index.js"></script>) or direct URL...`}
                  value={kitScriptUrl}
                  onChange={(e) => setKitScriptUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Kit Form ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7483921"
                  value={kitFormId}
                  onChange={(e) => setKitFormId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Embed Display Mode
                </label>
                <select
                  value={embedType}
                  onChange={(e: any) => setEmbedType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="script">Kit Dynamic JavaScript Script Tag</option>
                  <option value="iframe">Clean Iframe Container</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Custom SEO Meta Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Custom title for Google search results..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save & Publish Slug'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
