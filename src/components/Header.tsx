'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Mobile-Responsive Header Component with Animated Hamburger Navigation Drawer.
 *
 * @usecase Main navigation header offering responsive menu toggle on mobile devices (iPhone/Android) and inline navbar on desktop.
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered mobile-responsive header container.
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          className="flex items-center space-x-2 font-black text-xl text-white tracking-tight hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <span className="text-2xl">🩸</span>
          <span className="bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
            DiabetesCare PH
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
          <Link href="/#progression" className="text-purple-100 hover:text-white transition-colors">
            Progression & Metrics
          </Link>
          <Link href="/#education" className="text-purple-100 hover:text-white transition-colors">
            Educational Articles
          </Link>
          <Link href="/#awareness" className="text-purple-100 hover:text-white transition-colors">
            The Silent Killer
          </Link>
          <Link
            href="/#campaign"
            className="bg-white/15 hover:bg-white text-white hover:text-indigo-900 font-bold px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-md transition-all shadow-sm"
          >
            Take Action
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          className="md:hidden flex items-center justify-center p-2 rounded-xl text-purple-100 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all cursor-pointer"
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

      {/* Mobile Drawer Dropdown Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fadeIn w-full">
          <Link
            href="/#progression"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            📊 Progression & Metrics
          </Link>
          <Link
            href="/#education"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            📖 Educational Articles
          </Link>
          <Link
            href="/#awareness"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-xl text-base font-semibold text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            ⚠️ The Silent Killer
          </Link>
          <div className="pt-2">
            <Link
              href="/#campaign"
              onClick={closeMenu}
              className="block text-center py-3 px-4 rounded-xl text-base font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg border border-white/20 active:scale-98 transition-all"
            >
              🚀 Take Action
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
