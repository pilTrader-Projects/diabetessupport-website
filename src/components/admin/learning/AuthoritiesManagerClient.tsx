'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { IAuthority } from '@/types/learning';
import AuthorityModal, { AuthorityFormData } from '@/components/admin/learning/AuthorityModal';
import LearningAdminNav from '@/components/admin/learning/LearningAdminNav';

interface AuthoritiesManagerProps {
  initialAuthorities: IAuthority[];
}

/**
 * Extracts clean 2-letter initials for a doctor or medical authority,
 * gracefully stripping medical credentials (MD, PhD) and titles (Dr., Prof.).
 */
export function getDoctorInitials(name: string): string {
  if (!name || !name.trim()) return '??';
  const cleaned = name
    .replace(/\b(dr|doctor|prof|professor)\b\.?/gi, '')
    .replace(/,.*$/g, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AuthoritiesManagerClient({
  initialAuthorities,
}: AuthoritiesManagerProps): React.JSX.Element {
  const [authorities, setAuthorities] = useState<IAuthority[]>(initialAuthorities);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<IAuthority | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 6000);
  };

  // Compute stats for KPI banner
  const stats = useMemo(() => {
    const total = authorities.length;
    const active = authorities.filter((a) => a.isActive).length;
    const autoPublish = authorities.filter((a) => a.autoPublish && a.isActive).length;
    const totalBooks = authorities.reduce((acc, a) => acc + (a.recommendedBooks?.length || 0), 0);
    const withChannels = authorities.filter((a) => Boolean(a.youtubeChannelId)).length;
    return { total, active, autoPublish, totalBooks, withChannels };
  }, [authorities]);

  // Extract all unique specialties for filter dropdown
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    authorities.forEach((a) => {
      (a.specialties || []).forEach((s) => {
        if (s.trim()) set.add(s.trim());
      });
    });
    return Array.from(set).sort();
  }, [authorities]);

  // Filtered authorities list
  const filteredAuthorities = useMemo(() => {
    return authorities.filter((item) => {
      // Status filter
      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'paused' && item.isActive) return false;

      // Specialty filter
      if (
        selectedSpecialty !== 'all' &&
        !(item.specialties || []).some((s) => s.toLowerCase() === selectedSpecialty.toLowerCase())
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesSpecialty = (item.specialties || []).some((s) => s.toLowerCase().includes(query));
        const matchesChannel = (item.youtubeChannelId || '').toLowerCase().includes(query);
        const matchesBooks = (item.recommendedBooks || []).some((b) => b.title.toLowerCase().includes(query));
        if (!matchesName && !matchesTitle && !matchesSpecialty && !matchesChannel && !matchesBooks) {
          return false;
        }
      }

      return true;
    });
  }, [authorities, statusFilter, selectedSpecialty, searchQuery]);

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
      if (!res.ok) throw new Error(data.error || 'Failed to sync authority feed');

      const added = data.data?.totalAdded ?? 0;
      const skipped = data.data?.totalSkipped ?? 0;

      showNotification(
        'success',
        `Sync complete for ${name}! Ingested ${added} new video(s), skipped ${skipped} non-relevant.`
      );

      // Refresh lastSyncAt locally
      setAuthorities((prev) =>
        prev.map((item) => (item._id === id ? { ...item, lastSyncAt: new Date() } : item))
      );
    } catch (err: any) {
      showNotification('error', err.message || `Failed to sync feed for ${name}`);
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
        `Syndication complete! Ingested ${added} qualified video(s), skipped ${skipped} non-relevant across all active channels.`
      );

      // Refresh lastSyncAt for all active
      setAuthorities((prev) =>
        prev.map((item) => (item.isActive ? { ...item, lastSyncAt: new Date() } : item))
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Syndication engine failed');
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hub Section Sub-Navigation Bar */}
      <LearningAdminNav
        counts={{ authorities: authorities.length }}
        onRunGlobalSync={handleSyncAll}
        isSyncingGlobal={syncingAll}
      />

      {/* 2. Notification Toast */}
      {message && (
        <div
          role="alert"
          className={`p-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between shadow-lg ${
            message.type === 'success'
              ? 'bg-teal-950/90 border-teal-500/80 text-teal-200'
              : 'bg-rose-950/90 border-rose-500/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Executive KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Authorities</span>
            <span className="text-base">👨‍⚕️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">tracked</span>
          </div>
          <div className="mt-1 text-[11px] text-teal-400 font-medium">
            {stats.active} active in syndication
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Syndication</span>
            <span className="text-base">⚡</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{stats.active}</span>
            <span className="text-[11px] text-slate-400">/ {stats.total} live</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            {stats.autoPublish} with auto-publish
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Curated Books</span>
            <span className="text-base">📚</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{stats.totalBooks}</span>
            <span className="text-[11px] text-slate-400">recommendations</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            Affiliate links active
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>YouTube Channels</span>
            <span className="text-base">▶️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-400">{stats.withChannels}</span>
            <span className="text-[11px] text-slate-400">connected</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            RSS &amp; scraper ready
          </div>
        </div>
      </div>

      {/* 4. Filter & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, title, specialty, or channel..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Segmented Buttons */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({authorities.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'paused'
                  ? 'bg-slate-800 text-slate-200 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paused ({authorities.length - stats.active})
            </button>
          </div>

          {/* Specialty Dropdown */}
          {allSpecialties.length > 0 && (
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              aria-label="Filter by specialty"
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Specialties ({allSpecialties.length})</option>
              {allSpecialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: View Switcher & Primary Action */}
        <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid Card View"
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⊞</span>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Dense Table View"
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>☰</span>
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-teal-500/20 transition-all inline-flex items-center gap-1.5 active:scale-95"
          >
            <span>➕</span>
            <span>Register Authority</span>
          </button>
        </div>
      </div>

      {/* 5. Main Content: Grid View or Table View */}
      {filteredAuthorities.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-inner">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-white">No Matching Authorities</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all' || selectedSpecialty !== 'all'
              ? 'No authorities matched your current search filters. Try clearing your query or reset filters.'
              : 'No monitored medical authorities have been added yet. Click Register Authority to get started.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || selectedSpecialty !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSelectedSpecialty('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuthorities.map((item) => {
            const isSyncingThis = syncingId === item._id;
            const initials = getDoctorInitials(item.name);

            return (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/25 via-cyan-500/20 to-indigo-500/25 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black text-sm tracking-wider shadow-inner shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-white leading-tight truncate group-hover:text-teal-300 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {item.title || 'Medical Authority'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          item.isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {item.isActive ? 'Active' : 'Paused'}
                      </span>
                      {item.autoPublish && (
                        <span className="text-[9px] font-bold text-slate-400">⚡ Auto</span>
                      )}
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {item.bio ? (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No clinical biography specified.</p>
                  )}

                  {/* Specialties Pills */}
                  {item.specialties && item.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {item.specialties.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-950/90 text-teal-300/90 px-2 py-0.5 rounded-md border border-slate-800 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {item.specialties.length > 3 && (
                        <span className="text-[10px] bg-slate-950/60 text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-800">
                          +{item.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Channel Connection Box */}
                  <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="text-red-500 font-bold">▶</span>
                        <span>YouTube Feed:</span>
                      </div>
                      {item.youtubeChannelId ? (
                        <a
                          href={`https://www.youtube.com/channel/${item.youtubeChannelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300 hover:underline font-mono text-[10px] truncate max-w-[120px] inline-flex items-center gap-1"
                        >
                          <span>{item.youtubeChannelId.slice(0, 10)}...</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Not connected</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[10px] pt-0.5">
                      <span>Last Ingestion:</span>
                      <span>
                        {item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleDateString() : 'Never synced'}
                      </span>
                    </div>
                  </div>

                  {/* Curated Books & Protocols */}
                  {item.recommendedBooks && item.recommendedBooks.length > 0 ? (
                    <div className="p-2.5 bg-amber-950/15 border border-amber-900/30 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <span>📚</span> Books &amp; Protocols ({item.recommendedBooks.length})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-1">
                        {item.recommendedBooks.map((b) => b.title).join(' • ')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-950/40 border border-dashed border-slate-800/80 rounded-xl text-[10px] text-slate-500 flex items-center justify-between">
                      <span>No curated books attached</span>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="text-teal-400 hover:underline"
                      >
                        + Add Book
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSyncAuthority(item._id!, item.name)}
                    disabled={isSyncingThis || !item.youtubeChannelId}
                    title={!item.youtubeChannelId ? 'Set YouTube Channel ID first' : 'Sync Channel Feed Now'}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-teal-300 text-xs font-bold rounded-lg border border-slate-700/80 transition-colors disabled:opacity-40 inline-flex items-center gap-1 active:scale-95"
                  >
                    <span>{isSyncingThis ? '⏳ Syncing...' : '⚡ Sync Feed'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700/60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id!, item.name)}
                      title="Remove Authority"
                      className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-lg transition-colors border border-rose-900/40"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Authority &amp; Credential</th>
                  <th scope="col" className="py-3.5 px-4">Specialties</th>
                  <th scope="col" className="py-3.5 px-4">Channel Feed</th>
                  <th scope="col" className="py-3.5 px-4">Books</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAuthorities.map((item) => {
                  const isSyncingThis = syncingId === item._id;
                  const initials = getDoctorInitials(item.name);

                  return (
                    <tr key={item._id} className="hover:bg-slate-850/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.avatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.avatarUrl}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-extrabold text-xs shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{item.name}</span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {item.title || 'Medical Authority'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Specialties */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(item.specialties || []).slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-950 text-teal-300 px-1.5 py-0.5 rounded border border-slate-800"
                            >
                              {s}
                            </span>
                          ))}
                          {(item.specialties || []).length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +{(item.specialties || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4">
                        {item.youtubeChannelId ? (
                          <div className="space-y-0.5">
                            <a
                              href={`https://www.youtube.com/channel/${item.youtubeChannelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-400 hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                            >
                              <span>▶ Connected</span>
                              <span>↗</span>
                            </a>
                            <span className="text-[10px] text-slate-500 block">
                              Synced {item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unlinked</span>
                        )}
                      </td>

                      {/* Books */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <span>📚</span>
                          <span className="font-bold">{item.recommendedBooks?.length || 0}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              item.isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            {item.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSyncAuthority(item._id!, item.name)}
                            disabled={isSyncingThis || !item.youtubeChannelId}
                            title="Sync Feed"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-30"
                          >
                            {isSyncingThis ? '⏳' : '⚡ Sync'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id!, item.name)}
                            className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg transition-colors border border-rose-900/40"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Authority Edit/Add Modal */}
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
