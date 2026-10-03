'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SavedResourcesDrawer from '@/components/learning/SavedResourcesDrawer';
import {
  getSavedProtocolItems,
  PROTOCOL_UPDATE_EVENT,
  ISavedProtocolSummary,
} from '@/lib/savedProtocolUtils';

/**
 * Mobile-Responsive Header Component with Animated Hamburger Navigation Drawer.
 *
 * @usecase Main navigation header offering responsive menu toggle on mobile devices (iPhone/Android) and inline navbar on desktop.
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered mobile-responsive header container.
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<ISavedProtocolSummary[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    title: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    // Initial load of saved protocol items
    const items = getSavedProtocolItems();
    setSavedItems(items);

    const handleProtocolUpdate = (e: any) => {
      const detail = e.detail;
      if (detail && detail.items) {
        setSavedItems(detail.items);
      } else {
        setSavedItems(getSavedProtocolItems());
      }

      if (detail && detail.action === 'saved') {
        setToastNotification({
          title: detail.resourceTitle || 'Resource',
          count: detail.count || 1,
        });
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'metabolic_saved_resources' || e.key === 'metabolic_saved_items_cache') {
        setSavedItems(getSavedProtocolItems());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PROTOCOL_UPDATE_EVENT, handleProtocolUpdate);
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PROTOCOL_UPDATE_EVENT, handleProtocolUpdate);
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-purple-950 to-pink-950 text-white sticky top-0 z-50 shadow-xl border-b border-white/10 backdrop-blur-md w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center space-x-2.5 font-black text-xl text-white tracking-tight hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 text-slate-950 text-sm font-black shadow-md border border-white/30">
            ⏳
          </span>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent font-black leading-none text-lg">
              Before the Numbers
            </span>
            <span className="text-[10px] text-purple-200/80 font-semibold tracking-wider uppercase leading-tight">
              Don&apos;t wait for the diagnosis
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-5 text-sm font-semibold">
          <Link href="/hidden-clock" className="text-purple-100 hover:text-white transition-colors">
            The Hidden Clock
          </Link>
          <Link href="/learn" className="text-purple-100 hover:text-white transition-colors">
            Learning Hub
          </Link>
          <Link href="/glycosense" className="text-purple-100 hover:text-white transition-colors">
            Tools
          </Link>
          <Link href="/community" className="text-purple-100 hover:text-white transition-colors">
            Community
          </Link>
          <Link
            href="/ph"
            className="flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-amber-100 bg-amber-400/15 hover:bg-amber-400/25 px-2.5 py-1 rounded-full border border-amber-300/30 transition-all"
          >
            <span>🇵🇭</span>
            <span>Pilot (PH)</span>
          </Link>

          {/* Header-Level Saved Library Notification Pill */}
          <button
            type="button"
            onClick={() => setIsSavedDrawerOpen(true)}
            aria-label="Open My Saved Library"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              savedItems.length > 0
                ? 'bg-amber-400/25 hover:bg-amber-400/35 border-amber-300/40 text-amber-200 shadow-sm hover:scale-105'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-purple-100'
            }`}
          >
            <span>🔖</span>
            <span className="hidden lg:inline">My Library</span>
            {savedItems.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                {savedItems.length}
              </span>
            )}
          </button>

          <Link
            href="/#start-here"
            className="bg-white/15 hover:bg-white text-white hover:text-indigo-900 font-bold px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-md transition-all shadow-sm"
          >
            Start Here
          </Link>
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Header Library Badge */}
          <button
            type="button"
            onClick={() => setIsSavedDrawerOpen(true)}
            aria-label="Open My Saved Library"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400/25 border border-amber-300/40 text-amber-200 text-xs font-bold cursor-pointer"
          >
            <span>🔖</span>
            {savedItems.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {savedItems.length}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            className="flex items-center justify-center p-2 rounded-xl text-purple-100 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all cursor-pointer"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Floating Notification Balloon on Save */}
      {toastNotification && (
        <div className="absolute top-16 right-4 sm:right-8 z-50 animate-bounce-short">
          <div
            role="status"
            aria-live="polite"
            onClick={() => {
              setToastNotification(null);
              setIsSavedDrawerOpen(true);
            }}
            className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-600 border border-white/30 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-md cursor-pointer hover:border-white/50 transition-all text-xs text-white"
          >
            <span className="text-xl">✨</span>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>Saved to My Library!</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                  {toastNotification.count}
                </span>
              </p>
              <p className="text-[11px] text-amber-200 underline font-medium">
                Tap to open your curated library →
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setToastNotification(null);
              }}
              className="text-purple-200 hover:text-white p-1 ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Dropdown Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fadeIn w-full">
          <Link
            href="/hidden-clock"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            ⏱️ The Hidden Clock
          </Link>
          <Link
            href="/learn"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            🎓 Learning Hub
          </Link>
          <Link
            href="/glycosense"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            📱 Tools (GlycoSense)
          </Link>
          <Link
            href="/community"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            💬 Community Forum
          </Link>
          <Link
            href="/ph"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-bold text-amber-200 bg-amber-400/15 border border-amber-300/30 hover:bg-amber-400/25 transition-colors"
          >
            🇵🇭 Philippine Pilot Hub
          </Link>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              setIsSavedDrawerOpen(true);
            }}
            className="w-full text-left flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>🔖</span> My Saved Library
            </span>
            {savedItems.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                {savedItems.length}
              </span>
            )}
          </button>
          <div className="pt-2">
            <Link
              href="/#start-here"
              onClick={closeMenu}
              className="block text-center py-3 px-4 rounded-xl text-base font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg border border-white/20 active:scale-98 transition-all"
            >
              Start Here
            </Link>
          </div>
        </nav>
      )}

      {/* Global Saved Protocol Drawer */}
      <SavedResourcesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedResources={savedItems}
      />
    </header>
  );
}
