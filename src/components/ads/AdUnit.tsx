'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ADSENSE_CONFIG } from '@/config/constants';

export interface AdUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  fallbackType?: 'pwa' | 'cheatsheet';
}

/**
 * Zero-CLS Responsive Google AdSense Unit with Integrated House Ad Fallback.
 *
 * @usecase Renders AdSense ad slot with geometry reservation to eliminate layout shifts; renders fallback promotion when ads are un-filled or blocked.
 * @param {AdUnitProps} props Ad slot identifier, format, and fallback style.
 * @dependencies ADSENSE_CONFIG, React useEffect.
 * @returns {JSX.Element} Rendered ad unit or house fallback promotion.
 */
export default function AdUnit({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  fallbackType = 'pwa',
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    if (
      !ADSENSE_CONFIG.enabled ||
      !ADSENSE_CONFIG.publisherId ||
      ADSENSE_CONFIG.publisherId === 'ca-pub-0000000000000000'
    ) {
      setAdFailed(true);
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense push error or AdBlocker detected:', err);
      setAdFailed(true);
    }
  }, [slotId]);

  if (adFailed || !ADSENSE_CONFIG.enabled) {
    if (fallbackType === 'cheatsheet') {
      return (
        <div
          className={`my-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl shadow-sm text-center space-y-3 ${className}`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            ⚡ Free Patient Resource
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-900">
            Download the 7-Day Diabetes Action Plan & Sensitivity Cheatsheet PDF
          </h4>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Practical morning habits, low-GI Filipino meal swaps, and printable glucose tracking logs.
          </p>
          <div>
            <Link
              href="/guides/cheatsheet"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              Get Free PDF Download &rarr;
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`my-8 p-6 bg-gradient-to-r from-blue-950 via-purple-950 to-indigo-950 text-white rounded-3xl shadow-xl text-center space-y-3 border border-white/10 ${className}`}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
          📱 Smart Health Companion
        </span>
        <h4 className="text-base sm:text-lg font-black text-white">
          GlycoSense — Track Blood Glucose & Protect Your Family&apos;s Future
        </h4>
        <p className="text-xs text-purple-200 max-w-lg mx-auto leading-relaxed">
          Turn cost-efficient finger-prick logs and blood pressure checks into clear, doctor-ready health trends.
        </p>
        <div>
          <Link
            href="/#campaign"
            className="inline-block bg-white text-indigo-950 hover:bg-pink-100 text-xs font-black px-6 py-2.5 rounded-xl shadow-lg transition-all"
          >
            Explore GlycoSense Free &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`my-8 w-full overflow-hidden text-center min-h-[280px] flex flex-col justify-center items-center ${className}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 select-none">
        Advertisement
      </span>
      <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2 min-h-[250px] flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight: '250px' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
