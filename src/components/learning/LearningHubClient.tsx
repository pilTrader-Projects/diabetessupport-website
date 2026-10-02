'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IAuthority, ILearningResource, IPodcastChannel } from '@/types/learning';
import { IPost } from '@/types/blog';
import VideoPlayerModal from '@/components/learning/VideoPlayerModal';
import SavedResourcesDrawer from '@/components/learning/SavedResourcesDrawer';
import ResourceShareModal from '@/components/learning/ResourceShareModal';
import AdUnit from '@/components/ads/AdUnit';
import { getAllRecommendedBooks } from '@/config/affiliateBooks';
import {
  getSavedProtocolIds,
  saveProtocolResource,
  PROTOCOL_UPDATE_EVENT,
} from '@/lib/savedProtocolUtils';

interface LearningHubClientProps {
  initialAuthorities: IAuthority[];
  initialPodcastChannels?: IPodcastChannel[];
  initialResources: ILearningResource[];
  initialArticles: IPost[];
  initialSearch?: string;
  initialTopic?: string;
  initialFormat?: 'all' | 'video' | 'podcast' | 'article' | 'study' | 'book' | 'saved';
  initialAuthority?: string;
  initialPodcast?: string;
  initialResourceSlug?: string;
}

export default function LearningHubClient({
  initialAuthorities,
  initialPodcastChannels = [],
  initialResources,
  initialArticles,
  initialSearch = '',
  initialTopic = 'All',
  initialFormat = 'all',
  initialAuthority = 'all',
  initialPodcast = 'all',
  initialResourceSlug = '',
}: LearningHubClientProps): React.JSX.Element {
  const resolveInitialAuthorityId = (): string => {
    if (!initialAuthority || initialAuthority === 'all') return 'all';
    const match = initialAuthorities.find(
      (a) =>
        a._id === initialAuthority ||
        a.slug === initialAuthority ||
        a.name.toLowerCase().includes(initialAuthority.toLowerCase())
    );
    return match?._id || 'all';
  };

  const resolveInitialPodcastId = (): string => {
    if (!initialPodcast || initialPodcast === 'all') return 'all';
    const match = initialPodcastChannels.find(
      (p) =>
        p._id === initialPodcast ||
        p.slug === initialPodcast ||
        p.name.toLowerCase().includes(initialPodcast.toLowerCase())
    );
    return match?._id || 'all';
  };

  const [activeFormat, setActiveFormat] = useState<
    'all' | 'video' | 'podcast' | 'article' | 'study' | 'book' | 'saved'
  >(initialFormat);
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<string>(resolveInitialAuthorityId());
  const [selectedPodcastChannelId, setSelectedPodcastChannelId] = useState<string>(resolveInitialPodcastId());
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Modal & Drawer State
  const [playingResource, setPlayingResource] = useState<ILearningResource | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load and subscribe to saved protocol items
  useEffect(() => {
    setSavedIds(getSavedProtocolIds());

    const handleUpdate = () => {
      setSavedIds(getSavedProtocolIds());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PROTOCOL_UPDATE_EVENT, handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PROTOCOL_UPDATE_EVENT, handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);

  const handleToggleSave = (idOrResource: string | ILearningResource) => {
    let targetResource: any;
    if (typeof idOrResource === 'string') {
      targetResource = allItems.find((item) => item._id === idOrResource) || {
        _id: idOrResource,
        title: 'Resource',
        type: 'video',
      };
    } else {
      targetResource = idOrResource;
    }
    saveProtocolResource(targetResource);
    setSavedIds(getSavedProtocolIds());
  };

  const handlePlayVideo = (resource: ILearningResource) => {
    setPlayingResource(resource);
    setIsPlayerOpen(true);
  };

  // Build list of distinct topics dynamically from database resources
  const isValidTopic = (tag: string) => {
    if (!tag || typeof tag !== 'string') return false;
    const trimmed = tag.trim();
    if (trimmed.length < 3) return false;
    if (/^\d+$/.test(trimmed)) return false; // Ignore numeric WordPress IDs
    return true;
  };

  const allTopicsSet = new Set<string>();
  initialResources.forEach((res) => {
    res.topics?.filter(isValidTopic).forEach((t) => allTopicsSet.add(t));
  });
  initialArticles.forEach((art) => {
    if (art.category && isValidTopic(art.category)) allTopicsSet.add(art.category);
    art.tags?.filter(isValidTopic).forEach((t) => allTopicsSet.add(t));
  });
  const dynamicTopics = ['All', ...Array.from(allTopicsSet).slice(0, 12)];

  // Helper for dynamic contextual takeaway
  const getContextualTakeaway = (item: ILearningResource): string => {
    const rawTakeaway = item.keyTakeaways && item.keyTakeaways.length > 0 ? item.keyTakeaways[0] : '';
    if (!rawTakeaway || rawTakeaway.toLowerCase().includes('key scientific overview presented on')) {
      if (item.isGuestAppearance) {
        return `Clinical discussion exploring metabolic health, insulin dynamics, and real-world nutrition on ${item.podcastChannelName || 'podcast'}.`;
      }
      return `Essential lecture breakdown on insulin regulation, dietary protocols, and metabolic mechanisms by ${item.authorityName}.`;
    }
    return rawTakeaway;
  };

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
    sourceUrl: `/learn/${art.slug}`,
    platform: 'web',
    thumbnailUrl: art.featuredImage,
    duration: '5 min read',
    topics: art.category ? [art.category] : ['Diabetes Management'],
    status: 'published',
    publishedAt: art.publishedAt || art.createdAt,
  }));

  // Curated affiliate books & protocols from world-class metabolic authorities (DB-first, static fallback)
  const authorityBooks = initialAuthorities.flatMap((a) => a.recommendedBooks || []);
  const resourceBooks = initialResources.flatMap((r) => r.recommendedBooks || []);
  const combinedRawBooks = [...authorityBooks, ...resourceBooks];

  // Deduplicate by title
  const seenBookTitles = new Set<string>();
  const uniqueDynamicBooks = combinedRawBooks.filter((b) => {
    const key = (b.title || '').trim().toLowerCase();
    if (!key || seenBookTitles.has(key)) return false;
    seenBookTitles.add(key);
    return true;
  });

  const booksToRender = uniqueDynamicBooks.length > 0 ? uniqueDynamicBooks : getAllRecommendedBooks();

  const affiliateBookItems: ILearningResource[] = booksToRender.map((book) => ({
    _id: book._id,
    title: book.title,
    slug: book._id || book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    type: 'book',
    authorityName: book.author,
    authorityTitle: book.subtitle,
    summary: book.description,
    keyTakeaways: [
      book.description,
      `Platform: ${book.platformName || 'Amazon'}`,
      `Category: ${book.badgeText || 'Must-Read'}`,
    ],
    sourceUrl: book.affiliateUrl,
    platform: 'amazon',
    thumbnailUrl: book.coverUrl,
    duration: 'Book & Protocol',
    topics: book.topics || ['Metabolic Health', 'Insulin Resistance'],
    status: 'published',
  }));

  // Combine resources, articles, and affiliate books
  const allItems: ILearningResource[] = [...initialResources, ...articleItems, ...affiliateBookItems];

  // Auto-open specific resource if visitor navigated from a shared link (e.g. /blog?resource=...)
  useEffect(() => {
    if (initialResourceSlug) {
      const match = allItems.find(
        (item) =>
          item.slug === initialResourceSlug ||
          item._id === initialResourceSlug ||
          item.embedId === initialResourceSlug
      );
      if (match) {
        if (match.type === 'video' || match.type === 'podcast' || match.embedId) {
          handlePlayVideo(match);
        } else if (match.type === 'article' && match.slug) {
          window.location.href = `/learn/${encodeURIComponent(match.slug)}`;
        }
      }
    }
  }, [initialResourceSlug]);

  const [sharingResource, setSharingResource] = useState<ILearningResource | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleOpenShare = (resource: ILearningResource) => {
    setSharingResource(resource);
    setIsShareModalOpen(true);
  };

  // Counts for format tabs
  const videoCount = allItems.filter((i) => i.type === 'video' && !i.isGuestAppearance).length;
  const podcastCount = allItems.filter((i) => i.type === 'podcast' || i.isGuestAppearance).length;
  const studyCount = allItems.filter((i) => i.type === 'study').length;
  const articleCount = allItems.filter((i) => i.type === 'article').length;
  const bookCount = allItems.filter((i) => i.type === 'book').length;

  // Filter items
  const filteredItems = allItems.filter((item) => {
    // Format filter
    if (activeFormat === 'video' && (item.type !== 'video' || item.isGuestAppearance)) return false;
    if (activeFormat === 'podcast' && item.type !== 'podcast' && !item.isGuestAppearance) return false;
    if (activeFormat === 'study' && item.type !== 'study') return false;
    if (activeFormat === 'article' && item.type !== 'article') return false;
    if (activeFormat === 'book' && item.type !== 'book') return false;
    if (activeFormat === 'saved' && (!item._id || !savedIds.includes(item._id))) return false;

    // Authority filter
    if (selectedAuthorityId !== 'all') {
      const selectedAuth = initialAuthorities.find((a) => a._id === selectedAuthorityId);
      if (selectedAuth) {
        const authNameLower = selectedAuth.name.toLowerCase();
        const surname = selectedAuth.name.split(' ').slice(-1)[0].toLowerCase();
        const itemAuthLower = item.authorityName.toLowerCase();
        const matchesName =
          itemAuthLower.includes(authNameLower) ||
          itemAuthLower.includes(surname);
        const matchesId = item.authorityId === selectedAuthorityId;
        if (!matchesName && !matchesId) return false;
      }
    }

    // Podcast Channel filter
    if (selectedPodcastChannelId !== 'all') {
      const selectedChannel = initialPodcastChannels.find((c) => c._id === selectedPodcastChannelId);
      if (selectedChannel) {
        const matchesChannelName =
          item.podcastChannelName &&
          item.podcastChannelName.toLowerCase().includes(selectedChannel.name.toLowerCase());
        const matchesChannelId = item.podcastChannelId === selectedPodcastChannelId;
        if (!matchesChannelName && !matchesChannelId) return false;
      }
    }

    // Topic filter
    if (selectedTopic !== 'All') {
      const matchesTopic = item.topics.some((t) => t.toLowerCase() === selectedTopic.toLowerCase());
      if (!matchesTopic) return false;
    }

    // Search query (tokenized multi-term matching across title, authority, podcast show, summary, takeaways, and topics)
    if (searchQuery.trim()) {
      const searchTokens = searchQuery
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      if (searchTokens.length > 0) {
        const matchedAuthority = initialAuthorities.find(
          (a) =>
            a._id === item.authorityId ||
            a.name.toLowerCase() === item.authorityName.toLowerCase()
        );
        const authorityAliases = matchedAuthority?.aliases || [];

        const corpus = [
          item.title,
          item.authorityName,
          item.authorityTitle || '',
          ...authorityAliases,
          item.podcastChannelName || '',
          item.summary,
          ...(item.keyTakeaways || []),
          ...(item.topics || []),
        ]
          .join(' ')
          .toLowerCase();

        const matchesAllTokens = searchTokens.every((token) => corpus.includes(token));
        if (!matchesAllTokens) return false;
      }
    }

    return true;
  });

  // Collect saved resources for drawer
  const savedResources = allItems.filter((item) => item._id && savedIds.includes(item._id));

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
          <span>🌱</span> Evidence-Based Metabolic Science
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          The Metabolic Health &amp; Diabetes Reversal Hub
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          World-class lectures, peer-reviewed science, and practical guides to reversing insulin resistance—the hidden root cause of Type 2 diabetes, fatty liver, PCOS, and metabolic dysfunction.
        </p>

        {/* Global Search Bar */}
        <div className="pt-2 max-w-xl mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, condition, or keyword (e.g. Bikman, Autophagy, A1C)..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
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
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex flex-wrap items-center justify-center gap-1 border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveFormat('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              activeFormat === 'all'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌟 All Materials</span>
            <span className="text-[11px] opacity-80">({allItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('video')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              activeFormat === 'video'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎬 Videos &amp; Talks</span>
            <span className="text-[11px] opacity-80">({videoCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('podcast')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              activeFormat === 'podcast'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎙️ Podcasts &amp; Shows</span>
            <span className="text-[11px] opacity-80">({podcastCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('article')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              activeFormat === 'article'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📖 Editorial Guides</span>
            <span className="text-[11px] opacity-80">({articleCount})</span>
          </button>

          {studyCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFormat('study')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'study'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔬 Clinical Studies</span>
              <span className="text-[11px] opacity-80">({studyCount})</span>
            </button>
          )}

          {bookCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFormat('book')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'book'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📚 Books &amp; Protocols</span>
              <span className="text-[11px] opacity-80">({bookCount})</span>
            </button>
          )}

          {/* My Saved Library In-Page Filter Tab */}
          <button
            type="button"
            onClick={() => setActiveFormat('saved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              activeFormat === 'saved'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔖 My Library</span>
            {savedIds.length > 0 && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-black ${
                activeFormat === 'saved' ? 'bg-amber-400 text-slate-950' : 'bg-amber-400/25 text-amber-900 border border-amber-300/40'
              }`}>
                {savedIds.length}
              </span>
            )}
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

      {/* Podcast Shows Filter Bar (Displayed when initialPodcastChannels exist) */}
      {initialPodcastChannels && initialPodcastChannels.length > 0 && (activeFormat === 'all' || activeFormat === 'podcast') && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Filter by Podcast Show:</span>
            {selectedPodcastChannelId !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedPodcastChannelId('all')}
                className="text-purple-700 hover:underline font-bold"
              >
                Reset Show
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedPodcastChannelId('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedPodcastChannelId === 'all'
                  ? 'bg-purple-900 text-white border-purple-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Shows
            </button>

            {initialPodcastChannels.map((channel) => {
              const isSelected = selectedPodcastChannelId === channel._id;
              return (
                <button
                  key={channel._id}
                  type="button"
                  onClick={() => setSelectedPodcastChannelId(isSelected ? 'all' : channel._id!)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span>🎙️ {channel.name}</span>
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

      {/* Materials Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <span className="text-4xl">{activeFormat === 'saved' ? '🔖' : '🔍'}</span>
          <h3 className="text-lg font-bold text-slate-900">
            {activeFormat === 'saved' ? 'Your Saved Library is Empty' : 'No Learning Materials Found'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {activeFormat === 'saved'
              ? 'Click the "☆ Save" button on any video, lecture, study, or resource across the hub to build your personal library.'
              : 'No materials matched your filter combination. Try clearing your search query or selecting "All".'}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFormat('all');
              setSelectedAuthorityId('all');
              setSelectedPodcastChannelId('all');
              setSelectedTopic('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            {activeFormat === 'saved' ? 'Browse All Materials' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => {
            const isSaved = item._id ? savedIds.includes(item._id) : false;

            // Render Video / Podcast Card
            if (item.type === 'video' || item.type === 'podcast') {
              return (
                <React.Fragment key={item._id || item.slug}>
                  <article
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all group h-full"
                  >
                    <div className="space-y-4 p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Thumbnail with Lite Play Trigger */}
                        <div
                          id={`play-thumb-${index}`}
                          data-testid="play-thumb-trigger"
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
                            {item.type === 'podcast' || item.isGuestAppearance ? '🎙️ Podcast' : `🎬 ${item.platform}`}
                          </span>
                          {item.duration && (
                            <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white">
                              {item.duration}
                            </span>
                          )}
                        </div>

                        {/* Author & Title */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="font-bold text-teal-800 truncate max-w-[200px] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                              {item.authorityName}
                            </span>
                            {item.isGuestAppearance && item.podcastChannelName ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const match = initialPodcastChannels.find(
                                    (c) => c.name.toLowerCase() === item.podcastChannelName?.toLowerCase()
                                  );
                                  if (match?._id) {
                                    setSelectedPodcastChannelId(match._id);
                                    setActiveFormat('podcast');
                                  } else {
                                    setSearchQuery(item.podcastChannelName || '');
                                  }
                                }}
                                className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold truncate max-w-[160px] transition-colors cursor-pointer text-left"
                                title={`Filter by ${item.podcastChannelName}`}
                              >
                                🎙️ {item.podcastChannelName}
                              </button>
                            ) : (
                              <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {item.type === 'podcast' ? '🎙️ Podcast' : '🎬 Lecture'}
                              </span>
                            )}
                          </div>

                          <h2
                            className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-teal-700 cursor-pointer pt-0.5"
                            onClick={() => handlePlayVideo(item)}
                          >
                            {item.title}
                          </h2>
                        </div>
                      </div>

                      {/* 3 Key Takeaways Card */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1.5 mt-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 flex items-center gap-1">
                          <span>💡</span> Key Takeaway:
                        </span>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          • {getContextualTakeaway(item)}
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <button
                        type="button"
                        id={`play-video-btn-${index}`}
                        data-testid="play-video-btn"
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
                          {item.isGuestAppearance ? 'Watch Episode ↗' : 'Watch on YouTube ↗'}
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenShare(item)}
                          title="Found this material valuable? Share it!"
                          className="p-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-50 transition-colors"
                        >
                          📤
                        </button>

                        {item._id && (
                          <button
                            type="button"
                            onClick={() => handleToggleSave(item._id!)}
                            title={isSaved ? 'Remove from library' : 'Save to library'}
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

                  {/* Inline Sponsored Placement between row 1 and row 2 */}
                  {index === 2 && (
                    <div className="col-span-full my-2">
                      <AdUnit slotId="learning-feed-mid" format="horizontal" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            // Render Study / Clinical Trial Card
            if (item.type === 'study') {
              return (
                <React.Fragment key={item._id || item.slug}>
                  <article
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all h-full"
                  >
                    <div className="space-y-4 p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
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
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50/50 to-teal-50/50 border border-indigo-100 rounded-2xl p-4 text-xs space-y-1.5 mt-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
                          📊 Clinical Takeaway:
                        </span>
                        <p className="text-slate-700 line-clamp-3 leading-relaxed">
                          {item.keyTakeaways?.[0] || item.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
                      >
                        Read Study on PubMed ↗
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenShare(item)}
                          title="Found this study valuable? Share it!"
                          className="p-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-500 hover:text-indigo-700 hover:bg-slate-50 transition-colors"
                        >
                          📤
                        </button>

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
                    </div>
                  </article>

                  {index === 2 && (
                    <div className="col-span-full my-2">
                      <AdUnit slotId="learning-feed-mid" format="horizontal" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            // Render Affiliate Book & Clinical Protocol Card
            if (item.type === 'book') {
              return (
                <React.Fragment key={item._id || item.slug}>
                  <article className="bg-white rounded-3xl border border-amber-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-amber-400 transition-all h-full group">
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                          {item.thumbnailUrl ? (
                            <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-md border border-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-28 shrink-0 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
                              📚
                            </div>
                          )}

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] inline-block">
                              📖 Book &amp; Protocol
                            </span>
                            <h2 className="text-base font-bold text-slate-900 line-clamp-2 pt-1 group-hover:text-amber-800 transition-colors">
                              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer sponsored">
                                {item.title}
                              </a>
                            </h2>
                            <p className="text-xs font-semibold text-slate-500">
                              By {item.authorityName}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
                        <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-950 flex items-center gap-1">
                          <span>💡</span> Why Read This:
                        </span>
                        <p className="text-slate-700 line-clamp-2">
                          {item.keyTakeaways?.[0] || 'Essential clinical insights on reversing insulin resistance.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex items-center text-xs font-bold text-amber-700 hover:text-amber-900 group/link"
                      >
                        Get Book on Amazon ↗
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenShare(item)}
                          title="Found this material valuable? Share it!"
                          className="p-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-slate-50 transition-colors"
                        >
                          📤
                        </button>

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
                    </div>
                  </article>

                  {index === 2 && (
                    <div className="col-span-full my-2">
                      <AdUnit slotId="learning-feed-mid" format="horizontal" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            // Render Editorial Article Card
            return (
              <React.Fragment key={item._id || item.slug}>
                <article
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all h-full"
                >
                  <div className="space-y-4 p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
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
                          <span className="font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-[10px]">
                            📖 {item.topics[0] || 'Guide'}
                          </span>
                          <span className="text-slate-400 font-semibold">{item.duration}</span>
                        </div>

                        <h2 className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-teal-600 pt-1">
                          <Link href={`/learn/${item.slug}`}>{item.title.replace(/&nbsp;/g, ' ')}</Link>
                        </h2>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <Link
                      href={`/learn/${item.slug}`}
                      className="inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-900 group"
                    >
                      Read Full Article <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenShare(item)}
                        title="Found this guide valuable? Share it!"
                        className="p-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-50 transition-colors"
                      >
                        📤
                      </button>

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
                  </div>
                </article>

                {index === 2 && (
                  <div className="col-span-full my-2">
                    <AdUnit slotId="learning-feed-mid" format="horizontal" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Video Lite Embed Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        resource={playingResource}
        authorities={initialAuthorities}
        isSaved={playingResource?._id ? savedIds.includes(playingResource._id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Social Share Modal with Dynamic Photo Thumbnail Preview */}
      <ResourceShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        resource={sharingResource}
      />

      {/* Saved Protocol Slide-Out Drawer with Lead Capture */}
      <SavedResourcesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedResources={savedResources}
        authorities={initialAuthorities}
        onRemoveSaved={handleToggleSave}
        onSelectResource={(res) => {
          setIsSavedDrawerOpen(false);
          if (res.type === 'video' || res.type === 'podcast' || res.embedId) {
            handlePlayVideo(res);
          } else if (res.type === 'article' || (!res.sourceUrl && res.slug)) {
            window.location.href = `/learn/${encodeURIComponent(res.slug || res._id)}`;
          } else if (res.sourceUrl) {
            window.open(res.sourceUrl, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = `/learn?resource=${encodeURIComponent(res.slug || res._id)}`;
          }
        }}
      />
    </div>
  );
}
