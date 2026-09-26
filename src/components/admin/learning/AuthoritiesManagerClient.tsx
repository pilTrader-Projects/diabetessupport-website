'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IAuthority } from '@/types/learning';
import AuthorityModal, { AuthorityFormData } from '@/components/admin/learning/AuthorityModal';

interface AuthoritiesManagerProps {
  initialAuthorities: IAuthority[];
}

export default function AuthoritiesManagerClient({
  initialAuthorities,
}: AuthoritiesManagerProps): React.JSX.Element {
  const [authorities, setAuthorities] = useState<IAuthority[]>(initialAuthorities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<IAuthority | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleOpenAdd = () => {
    setEditingAuthority(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IAuthority) => {
    setEditingAuthority(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: AuthorityFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        specialties: formData.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingAuthority && editingAuthority._id) {
        const res = await fetch(`/api/v1/admin/learning/authorities/${editingAuthority._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update authority');

        setAuthorities((prev) =>
          prev.map((item) => (item._id === editingAuthority._id ? result.data : item))
        );
        showNotification('success', `Updated ${result.data.name} successfully.`);
      } else {
        const res = await fetch('/api/v1/admin/learning/authorities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create authority');

        setAuthorities((prev) => [...prev, result.data]);
        showNotification('success', `Registered ${result.data.name} successfully.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? Ingested materials will remain cataloged.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/learning/authorities/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete authority');

      setAuthorities((prev) => prev.filter((item) => item._id !== id));
      showNotification('success', `Removed ${name} from monitored authorities.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  const handleSyncAuthority = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      const res = await fetch('/api/v1/admin/learning/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorityId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');

      const added = data.data?.addedCount ?? 0;
      const skipped = data.data?.skippedCount ?? 0;
      const errors = data.data?.errors || [];

      if (errors.length > 0 && added === 0) {
        showNotification('error', `Sync issue for ${name}: ${errors.join('; ')}`);
      } else if (skipped > 0) {
        showNotification(
          'success',
          `Sync completed for ${name}: ${added} qualified video(s) added, ${skipped} non-relevant video(s) skipped.`
        );
      } else {
        showNotification(
          'success',
          `Sync completed for ${name}: ${added} new video(s) ingested into library.`
        );
      }

      // Update local lastSyncAt and re-fetch authorities list to show resolved UC ID
      const ref = await fetch('/api/v1/admin/learning/authorities');
      const refData = await ref.json();
      if (refData.success) {
        setAuthorities(refData.data);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await fetch('/api/v1/admin/learning/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Syndication cron failed');

      const added = data.data?.totalAdded ?? 0;
      const skipped = data.data?.totalSkipped ?? 0;

      showNotification(
        'success',
        `Syndication cron complete! Ingested ${added} qualified video(s), skipped ${skipped} non-relevant video(s) across all active authorities.`
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Syndication cron failed');
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Monitored Doctors &amp; Authorities</h2>
          <p className="text-xs text-slate-400 mt-1">
            Define reputable medical authorities to track. Feeds are AI-qualified against advocacy topics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/learning/resources"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            📚 View Cataloged Resources &rarr;
          </Link>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{syncingAll ? '⏳ Running Syndication Cron...' : '⚡ Run Syndication Cron'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>➕ Register Authority</span>
          </button>
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

      {/* Authorities Grid */}
      {authorities.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <span className="text-4xl">👨‍⚕️</span>
          <h3 className="text-lg font-bold text-white">No Monitored Authorities Registered</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Register Authority&quot; above to add your first doctor, researcher, or podcast host (e.g. Dr. Benjamin Bikman, Dr. Jason Fung).
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl"
          >
            Register First Authority
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorities.map((item) => {
            const isSyncingThis = syncingId === item._id;

            return (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {item.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold text-lg">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-extrabold text-white leading-tight">{item.name}</h4>
                        <p className="text-xs text-teal-400 font-medium truncate max-w-[180px]">{item.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          item.isActive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Paused'}
                      </span>
                      {item.autoPublish && (
                        <span className="text-[9px] font-bold text-slate-400">⚡ Auto-Publish</span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {item.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.bio}
                    </p>
                  )}

                  {/* Specialties Pills */}
                  {item.specialties && item.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.specialties.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Channel / Feed Details */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>YouTube Channel ID:</span>
                      <span className="text-slate-200 font-mono truncate max-w-[140px]">
                        {item.youtubeChannelId || 'None'}
                      </span>
                    </div>
                    {item.lastSyncAt && (
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>Last Synced:</span>
                        <span>{new Date(item.lastSyncAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSyncAuthority(item._id!, item.name)}
                    disabled={isSyncingThis || !item.youtubeChannelId}
                    title={!item.youtubeChannelId ? 'Register a YouTube Channel ID to sync' : 'Sync Channel Now'}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-teal-400 text-xs font-bold rounded-lg border border-slate-700 transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                  >
                    <span>{isSyncingThis ? '⏳ Syncing...' : '⚡ Sync Feed'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id!, item.name)}
                      className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-lg transition-colors border border-rose-900/40"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authority Edit/Add Modal */}
      <AuthorityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingAuthority}
        submitting={submitting}
      />
    </div>
  );
}
