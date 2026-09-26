'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IAuthority, ILearningResource } from '@/types/learning';
import { IPost } from '@/types/blog';
import VideoPlayerModal from '@/components/learning/VideoPlayerModal';
import SavedResourcesDrawer from '@/components/learning/SavedResourcesDrawer';
import AdUnit from '@/components/ads/AdUnit';

interface LearningHubClientProps {
  initialAuthorities: IAuthority[];
  initialResources: ILearningResource[];
  initialArticles: IPost[];
  initialSearch?: string;
  initialTopic?: string;
}

export default function LearningHubClient({
  initialAuthorities,
  initialResources,
  initialArticles,
  initialSearch = '',
  initialTopic = 'All',
}: LearningHubClientProps): React.JSX.Element {
  const [activeFormat, setActiveFormat] = useState<'all' | 'video' | 'article' | 'study'>('all');
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Modal & Drawer State
  const [playingResource, setPlayingResource] = useState<ILearningResource | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('diabetes_saved_protocol');
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {
      // ignore storage failure
    }
  }, []);

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('diabetes_saved_protocol', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handlePlayVideo = (resource: ILearningResource) => {
    setPlayingResource(resource);
    setIsPlayerOpen(true);
  };

  // Build list of distinct topics dynamically from database resources
  const allTopicsSet = new Set<string>();
  initialResources.forEach((res) => {
    res.topics?.forEach((t) => allTopicsSet.add(t));
  });
  initialArticles.forEach((art) => {
    if (art.category) allTopicsSet.add(art.category);
    art.tags?.forEach((t) => allTopicsSet.add(t));
  });
  const dynamicTopics = ['All', ...Array.from(allTopicsSet).slice(0, 10)];

  // Convert editorial articles to a unified shape for filtering
  const articleItems: ILearningResource[] = initialArticles.map((art) => ({
    _id: art._id,
    title: art.title,
    slug: art.slug,
    type: 'article',
    authorityName: 'Editorial Staff',
    authorityTitle: 'Clinical & Lifestyle Review',
    summary: art.excerpt || '',
    keyTakeaways: [
      art.excerpt ? art.excerpt.slice(0, 120) + '...' : 'Evidence-based editorial health guide.',
    ],
    sourceUrl: `/blog/${art.slug}`,
    platform: 'web',
    thumbnailUrl: art.featuredImage,
    duration: '5 min read',
    topics: art.category ? [art.category] : ['Diabetes Management'],
    status: 'published',
    publishedAt: art.publishedAt || art.createdAt,
  }));

  // Combine resources and articles
  const allItems: ILearningResource[] = [...initialResources, ...articleItems];

  // Counts for format tabs
  const videoCount = allItems.filter((i) => i.type === 'video' || i.type === 'podcast').length;
  const studyCount = allItems.filter((i) => i.type === 'study').length;
  const articleCount = allItems.filter((i) => i.type === 'article').length;

  // Filter items
  const filteredItems = allItems.filter((item) => {
    // Format filter
    if (activeFormat === 'video' && item.type !== 'video' && item.type !== 'podcast') return false;
    if (activeFormat === 'study' && item.type !== 'study') return false;
    if (activeFormat === 'article' && item.type !== 'article') return false;

    // Authority filter
    if (selectedAuthorityId !== 'all') {
      const selectedAuth = initialAuthorities.find((a) => a._id === selectedAuthorityId);
      if (selectedAuth) {
        const matchesName = item.authorityName.toLowerCase().includes(selectedAuth.name.toLowerCase());
        const matchesId = item.authorityId === selectedAuthorityId;
        if (!matchesName && !matchesId) return false;
      }
    }

    // Topic filter
    if (selectedTopic !== 'All') {
      const matchesTopic = item.topics.some((t) => t.toLowerCase() === selectedTopic.toLowerCase());
      if (!matchesTopic) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesText =
        item.title.toLowerCase().includes(query) ||
        item.authorityName.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.topics.some((t) => t.toLowerCase().includes(query));
      if (!matchesText) return false;
    }

    return true;
  });

  // Collect saved resources for drawer
  const savedResources = allItems.filter((item) => item._id && savedIds.includes(item._id));

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <span className="bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200 inline-flex items-center gap-1.5">
          <span>🎓</span> Learning Materials &amp; Evidence Hub
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Metabolic Science &amp; Health Library
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Curated lectures, clinical trials, and protocols from world-renowned doctors and scientists on Low Carb, Intermittent Fasting, and Natural Healing.
        </p>

        {/* Global Search Bar */}
        <div className="pt-2 max-w-xl mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, condition, or keyword (e.g. Bikman, Autophagy, A1C)..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-3.5 top-5.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Format Tabs (Segmented Control) */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex flex-wrap items-center justify-center gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveFormat('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
              activeFormat === 'all'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌟 All Materials</span>
            <span className="text-[11px] opacity-80">({allItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('video')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
              activeFormat === 'video'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎬 Videos &amp; Talks</span>
            <span className="text-[11px] opacity-80">({videoCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('article')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
              activeFormat === 'article'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📖 Editorial Guides</span>
            <span className="text-[11px] opacity-80">({articleCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('study')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
              activeFormat === 'study'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔬 Clinical Studies</span>
            <span className="text-[11px] opacity-80">({studyCount})</span>
          </button>
        </div>
      </div>

      {/* Authorities Carousel Filter Bar (Loaded dynamically from DB) */}
      {initialAuthorities.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Filter by Authority / Speaker:</span>
            {selectedAuthorityId !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedAuthorityId('all')}
                className="text-teal-700 hover:underline"
              >
                Reset Authority
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedAuthorityId('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedAuthorityId === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Experts
            </button>

            {initialAuthorities.map((auth) => {
              const isSelected = selectedAuthorityId === auth._id;
              return (
                <button
                  key={auth._id}
                  type="button"
                  onClick={() => setSelectedAuthorityId(isSelected ? 'all' : auth._id!)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {auth.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={auth.avatarUrl}
                      alt={auth.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                      {auth.name.charAt(0)}
                    </span>
                  )}
                  <span>{auth.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Topic Chips Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-slate-400 mr-1">Topics:</span>
        {dynamicTopics.map((topic) => {
          const isSelected = selectedTopic.toLowerCase() === topic.toLowerCase();
          return (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* Top Ad Unit */}
      <AdUnit slotId="learning-feed-top" format="horizontal" />

      {/* Materials Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-slate-900">No Learning Materials Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No materials matched your filter combination. Try clearing your search query or selecting &quot;All&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFormat('all');
              setSelectedAuthorityId('all');
              setSelectedTopic('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isSaved = item._id ? savedIds.includes(item._id) : false;

            // Render Video / Podcast Card
            if (item.type === 'video' || item.type === 'podcast') {
              return (
                <article
                  key={item._id || item.slug}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all group"
                >
                  <div className="space-y-4 p-6">
                    {/* Thumbnail with Lite Play Trigger */}
                    <div
                      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 cursor-pointer group"
                      onClick={() => handlePlayVideo(item)}
                    >
                      {item.thumbnailUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-4xl">
                          🎬
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                        <div className="w-12 h-12 rounded-full bg-teal-600/90 group-hover:bg-teal-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          ▶
                        </div>
                      </div>

                      {/* Platform & Duration Badges */}
                      <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-950/85 text-white backdrop-blur-md border border-white/20">
                        🎬 {item.platform}
                      </span>
                      {item.duration && (
                        <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Author & Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-800 truncate max-w-[200px]">
                          {item.authorityName}
                        </span>
                        <span className="text-slate-400 font-medium">Lecture</span>
                      </div>

                      <h2
                        className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-teal-700 cursor-pointer pt-0.5"
                        onClick={() => handlePlayVideo(item)}
                      >
                        {item.title}
                      </h2>
                    </div>

                    {/* 3 Key Takeaways Card */}
                    {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                          💡 Key Insight:
                        </span>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          • {item.keyTakeaways[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => handlePlayVideo(item)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                    >
                      ▶ Play Video
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                      >
                        Watch on YouTube ↗
                      </a>

                      {item._id && (
                        <button
                          type="button"
                          onClick={() => handleToggleSave(item._id!)}
                          title={isSaved ? 'Remove from saved' : 'Save to protocol'}
                          className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isSaved
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isSaved ? '★' : '☆'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }

            // Render Study / Clinical Trial Card
            if (item.type === 'study') {
              return (
                <article
                  key={item._id || item.slug}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all"
                >
                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[10px]">
                        🔬 Clinical Study
                      </span>
                      <span className="text-slate-400 font-semibold">{item.authorityName}</span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-teal-700 pt-1">
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h2>

                    <div className="bg-gradient-to-br from-indigo-50/50 to-teal-50/50 border border-indigo-100 rounded-2xl p-4 text-xs space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
                        📊 Clinical Takeaway:
                      </span>
                      <p className="text-slate-700 line-clamp-3 leading-relaxed">
                        {item.keyTakeaways?.[0] || item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
                    >
                      Read Study on PubMed ↗
                    </a>

                    {item._id && (
                      <button
                        type="button"
                        onClick={() => handleToggleSave(item._id!)}
                        className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          isSaved
                            ? 'bg-amber-50 text-amber-600 border-amber-300'
                            : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSaved ? '★ Saved' : '☆ Save'}
                      </button>
                    )}
                  </div>
                </article>
              );
            }

            // Render Editorial Article Card
            return (
              <article
                key={item._id || item.slug}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className="space-y-4 p-6">
                  {item.thumbnailUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center text-teal-700 text-3xl font-extrabold border border-teal-100">
                      📖 Editorial Guide
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                        {item.topics[0] || 'Guide'}
                      </span>
                      <span className="text-slate-400 font-semibold">{item.duration}</span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-teal-600 pt-1">
                      <Link href={`/blog/${item.slug}`}>{item.title.replace(/&nbsp;/g, ' ')}</Link>
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${item.slug}`}
                    className="inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-900 group"
                  >
                    Read Full Article <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>

                  {item._id && (
                    <button
                      type="button"
                      onClick={() => handleToggleSave(item._id!)}
                      className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        isSaved
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSaved ? '★ Saved' : '☆ Save'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Bookmark Pill (Lead Magnet trigger) */}
      {savedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsSavedDrawerOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-2xl border border-teal-400/40 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <span>🔖 Saved Protocol</span>
            <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded-full text-[11px] font-black">
              {savedIds.length}
            </span>
          </button>
        </div>
      )}

      {/* Video Lite Embed Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        resource={playingResource}
        isSaved={playingResource?._id ? savedIds.includes(playingResource._id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Saved Protocol Slide-Out Drawer with Lead Capture */}
      <SavedResourcesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedResources={savedResources}
        onRemoveSaved={handleToggleSave}
        onSelectResource={(res) => {
          setIsSavedDrawerOpen(false);
          if (res.type === 'video') {
            handlePlayVideo(res);
          } else if (res.sourceUrl) {
            window.open(res.sourceUrl, '_blank');
          }
        }}
      />
    </div>
  );
}
