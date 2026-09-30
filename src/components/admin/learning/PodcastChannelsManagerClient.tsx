'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IPodcastChannel } from '@/types/learning';
import PodcastChannelModal, { PodcastChannelFormData } from '@/components/admin/learning/PodcastChannelModal';
import LearningAdminNav from '@/components/admin/learning/LearningAdminNav';

interface PodcastChannelsManagerProps {
  initialChannels: IPodcastChannel[];
}

export default function PodcastChannelsManagerClient({
  initialChannels,
}: PodcastChannelsManagerProps): React.JSX.Element {
  const [channels, setChannels] = useState<IPodcastChannel[]>(initialChannels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<IPodcastChannel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Guest & Topic Search modal
  const [guestModal, setGuestModal] = useState<{ isOpen: boolean; channel: IPodcastChannel | null }>({
    isOpen: false,
    channel: null,
  });
  const [guestKeywordInput, setGuestKeywordInput] = useState('');
  const [isSearchingGuests, setIsSearchingGuests] = useState(false);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 6000);
  };

  const handleOpenAdd = () => {
    setEditingChannel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IPodcastChannel) => {
    setEditingChannel(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: PodcastChannelFormData) => {
    setSubmitting(true);
    try {
      if (editingChannel && editingChannel._id) {
        const res = await fetch(`/api/v1/admin/learning/podcast-channels/${editingChannel._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update podcast show');

        setChannels((prev) =>
          prev.map((item) => (item._id === editingChannel._id ? result.data : item))
        );
        showNotification('success', `Updated show "${result.data.name}" successfully.`);
      } else {
        const res = await fetch('/api/v1/admin/learning/podcast-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create podcast show');

        setChannels((prev) => [...prev, result.data]);
        showNotification('success', `Registered show "${result.data.name}" successfully.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? Ingested episodes will remain cataloged.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/learning/podcast-channels/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete podcast show');

      setChannels((prev) => prev.filter((item) => item._id !== id));
      showNotification('success', `Removed "${name}" from monitored podcast shows.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  const handleSyncChannel = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      const res = await fetch('/api/v1/admin/learning/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcastChannelId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');

      const added = data.data?.addedCount ?? 0;
      const skipped = data.data?.skippedCount ?? 0;

      showNotification(
        'success',
        `Sync complete for "${name}"! Ingested ${added} qualified guest appearance(s), skipped ${skipped} non-authority/off-topic episode(s).`
      );

      // Refresh list to update lastSyncAt
      const ref = await fetch('/api/v1/admin/learning/podcast-channels');
      const refData = await ref.json();
      if (refData.success) {
        setChannels(refData.data);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  const handleOpenGuestSearch = (channel: IPodcastChannel) => {
    setGuestModal({ isOpen: true, channel });
    setGuestKeywordInput('Dr. Jason Fung, Dr. Ben Bikman');
  };

  const handleExecuteGuestSearch = async () => {
    if (!guestModal.channel?._id) return;
    const channel = guestModal.channel;
    const keywords = guestKeywordInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (keywords.length === 0) {
      showNotification('error', 'Please specify at least one guest name or keyword.');
      return;
    }

    setIsSearchingGuests(true);
    try {
      const res = await fetch('/api/v1/admin/learning/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcastChannelId: channel._id, keywords, searchGuestAuthorities: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search podcast guests');

      const added = data.data?.addedCount ?? 0;
      const skipped = data.data?.skippedCount ?? 0;

      showNotification(
        'success',
        `Discovered ${added} guest appearance(s) on "${channel.name}" matching "${keywords.join(', ')}"! Skipped ${skipped} non-authority/off-topic.`
      );

      // Refresh list to update lastSyncAt
      const ref = await fetch('/api/v1/admin/learning/podcast-channels');
      const refData = await ref.json();
      if (refData.success) {
        setChannels(refData.data);
      }
      setGuestModal({ isOpen: false, channel: null });
    } catch (err: any) {
      showNotification('error', err.message || `Failed to search guests for ${channel.name}`);
    } finally {
      setIsSearchingGuests(false);
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
        `Syndication cron complete! Ingested ${added} qualified video(s), skipped ${skipped} non-relevant video(s) across all authorities and podcast shows.`
      );

      const ref = await fetch('/api/v1/admin/learning/podcast-channels');
      const refData = await ref.json();
      if (refData.success) {
        setChannels(refData.data);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Syndication cron failed');
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hub Section Sub-Navigation Bar */}
      <LearningAdminNav
        counts={{ podcasts: channels.length }}
        onRunGlobalSync={handleSyncAll}
        isSyncingGlobal={syncingAll}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Monitored Podcast Shows</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track major podcast channels (e.g. DOAC, Joe Rogan) to automatically discover and curate authority guest appearances.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-teal-500/20 transition-all inline-flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <span>➕ Register Podcast Show</span>
        </button>
      </div>

      {/* Information Box */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-teal-400">
          <span>💡</span>
          <span>How Podcast Guest Syndication Works</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          The cron engine checks each show&apos;s feed for new episodes. Our AI qualification engine evaluates whether one of our registered <strong>Medical Authorities</strong> is the guest AND if the episode covers <strong>metabolic health, insulin resistance, or diabetes</strong>.
        </p>
        <p className="text-slate-400 leading-relaxed">
          If qualified, the episode is automatically listed under both the podcast channel and the guest authority. Off-topic episodes or unrelated guests are saved as <code className="text-slate-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">rejected</code>, ensuring they are <strong>never evaluated again</strong> and consuming 0 additional AI tokens on future cron runs.
        </p>
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

      {/* Channels Grid */}
      {channels.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <span className="text-5xl">🎙️</span>
          <h3 className="text-lg font-bold text-white">No Monitored Podcast Shows Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Register popular podcast shows like The Diary Of A CEO or Joe Rogan Experience to automatically extract guest appearances by our medical authorities.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors inline-block"
          >
            ➕ Register First Podcast Show
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div
              key={channel._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    {channel.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={channel.avatarUrl}
                        alt={channel.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-teal-400 shadow-md">
                        🎙️
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight group-hover:text-teal-400 transition-colors">
                        {channel.name}
                      </h4>
                      {channel.host && (
                        <p className="text-xs text-slate-400 mt-0.5">Hosted by {channel.host}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      channel.isActive
                        ? 'bg-teal-950/80 text-teal-400 border-teal-800/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {channel.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                {channel.description && (
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {channel.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">YouTube Feed:</span>
                    <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">
                      {channel.youtubeChannelId || 'Not set'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Auto-Publish:</span>
                    <span className={channel.autoPublish ? 'text-teal-400 font-semibold' : 'text-amber-400'}>
                      {channel.autoPublish ? 'Enabled (Auto)' : 'Manual Review'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Synced:</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {channel.lastSyncAt ? new Date(channel.lastSyncAt).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => channel._id && handleSyncChannel(channel._id, channel.name)}
                    disabled={syncingId === channel._id}
                    className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <span>{syncingId === channel._id ? '⏳ Syncing...' : '🔄 Sync Episodes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGuestSearch(channel)}
                    className="px-2.5 py-1.5 bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-800/50 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    title="Search podcast channel for specific guest doctors and topics"
                  >
                    <span>🎯 Guest Search</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(channel)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Edit Show"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => channel._id && handleDelete(channel._id, channel.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete Show"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PodcastChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingChannel}
        submitting={submitting}
      />

      {/* Guest & Topic Search Modal for Podcasts */}
      {guestModal.isOpen && guestModal.channel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎯</span>
                  <span>Targeted Guest & Topic Ingestion</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Search YouTube for episodes of <strong className="text-teal-400">{guestModal.channel.name}</strong> featuring specific doctors or topics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuestModal({ isOpen: false, channel: null })}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Guest Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Quick Doctor & Topic Queries (Click to add)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Dr. Jason Fung',
                  'Dr. Ben Bikman',
                  'Dr. Pradip Jamnadas',
                  'Dr. Peter Attia',
                  'Dr. Robert Lustig',
                  'Diabetes',
                  'Fasting',
                  'Insulin Resistance',
                ].map((guestName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const current = guestKeywordInput
                        .split(',')
                        .map((x) => x.trim())
                        .filter(Boolean);
                      if (!current.includes(guestName)) {
                        setGuestKeywordInput(current.length > 0 ? `${guestKeywordInput}, ${guestName}` : guestName);
                      }
                    }}
                    className="text-xs px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-teal-300 rounded-lg border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
                  >
                    + {guestName}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Input */}
            <div className="space-y-1.5">
              <label htmlFor="podcast-guests-input" className="text-[11px] font-bold text-slate-300 block">
                Doctor names or topics to query (comma-separated):
              </label>
              <input
                id="podcast-guests-input"
                type="text"
                value={guestKeywordInput}
                onChange={(e) => setGuestKeywordInput(e.target.value)}
                placeholder="e.g. Dr. Jason Fung, Dr. Ben Bikman, fasting"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Queries YouTube directly for &quot;{guestModal.channel.name}&quot; paired with each guest name, evaluates relevance with clinical AI, and links the episode to the respective authority.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGuestModal({ isOpen: false, channel: null })}
                disabled={isSearchingGuests}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteGuestSearch}
                disabled={isSearchingGuests || !guestKeywordInput.trim()}
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSearchingGuests ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching YouTube...</span>
                  </>
                ) : (
                  <>
                    <span>🔍 Ingest Guest Episodes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
