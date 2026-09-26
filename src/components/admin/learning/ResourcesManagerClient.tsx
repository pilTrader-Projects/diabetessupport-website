'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ILearningResource, ResourceType, ResourceStatus } from '@/types/learning';
import ResourceModal, { ResourceFormData } from '@/components/admin/learning/ResourceModal';

interface ResourcesManagerProps {
  initialResources: ILearningResource[];
  totalCount: number;
}

export default function ResourcesManagerClient({
  initialResources,
  totalCount,
}: ResourcesManagerProps): React.JSX.Element {
  const [resources, setResources] = useState<ILearningResource[]>(initialResources);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ILearningResource | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleOpenAdd = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: ILearningResource) => {
    setEditingResource(res);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: ResourceFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        keyTakeaways: formData.keyTakeaways
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        topics: formData.topics
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingResource && editingResource._id) {
        const res = await fetch(`/api/v1/admin/learning/resources/${editingResource._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update resource');

        setResources((prev) =>
          prev.map((item) => (item._id === editingResource._id ? result.data : item))
        );
        showNotification('success', `Updated resource "${result.data.title}" successfully.`);
      } else {
        const res = await fetch('/api/v1/admin/learning/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to add resource');

        setResources((prev) => [result.data, ...prev]);
        showNotification('success', `Added "${result.data.title}" to library catalog.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/learning/resources/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete resource');

      setResources((prev) => prev.filter((item) => item._id !== id));
      showNotification('success', `Removed "${title}" from catalog.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  const handleValidateHealth = async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/v1/admin/learning/validate', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Validation failed');

      const { checked, broken } = data.data;
      showNotification(
        'success',
        `Link health check complete! Checked ${checked} video(s); ${broken} flagged as broken or private.`
      );

      // Refresh list
      const ref = await fetch('/api/v1/admin/learning/resources');
      const refData = await ref.json();
      if (refData.success) {
        setResources(refData.data.resources);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  // Filter local resources based on type, status, and search
  const filtered = resources.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Cataloged Learning Materials ({totalCount})</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse, curate, and verify evidence-based videos, clinical trials, and articles shown on the public Learning Hub.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/learning/authorities"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            🩺 Manage Authorities &rarr;
          </Link>

          <button
            type="button"
            onClick={handleValidateHealth}
            disabled={validating}
            className="px-4 py-2.5 bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{validating ? '🔍 Checking Health...' : '🔍 Run Link-Rot Check'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>➕ Add Resource Manually</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, authority name, or topic keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Formats</option>
            <option value="video">🎬 Videos</option>
            <option value="podcast">🎙️ Podcasts</option>
            <option value="study">🔬 Studies</option>
            <option value="article">📖 Articles</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">🟢 Published</option>
            <option value="pending_review">🟡 Pending Review</option>
            <option value="broken_link">🔴 Broken Link</option>
            <option value="archived">⚪ Archived</option>
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold transition-all border ${
            message.type === 'success'
              ? 'bg-teal-950/80 border-teal-500 text-teal-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Resources List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <span className="text-4xl">📚</span>
          <h3 className="text-lg font-bold text-white">No Resources Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search query, or click &quot;Add Resource Manually&quot; to add a video or study.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="space-y-3">
                {/* Thumbnail & Badges */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  {item.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {item.type === 'study' ? '🔬' : item.type === 'video' ? '🎬' : '📖'}
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md border border-white/20">
                      {item.type}
                    </span>
                    {item.validationStatus === 'broken' && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-200 border border-rose-500">
                        Broken Link
                      </span>
                    )}
                  </div>

                  {item.duration && (
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white">
                      {item.duration}
                    </span>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-400">{item.authorityName}</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'published'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'pending_review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-white line-clamp-2 hover:text-teal-300">
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h4>

                {/* Key Takeaways */}
                {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      💡 Key Takeaway:
                    </span>
                    <p className="line-clamp-2 leading-relaxed text-slate-400">
                      • {item.keyTakeaways[0]}
                    </p>
                  </div>
                )}

                {/* Topics */}
                <div className="flex flex-wrap gap-1">
                  {item.topics?.map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                >
                  Source ↗
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id!, item.title)}
                    className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-lg transition-colors border border-rose-900/40"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingResource}
        submitting={submitting}
      />
    </div>
  );
}
