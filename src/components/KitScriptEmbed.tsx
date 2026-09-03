'use client';

import React, { useEffect, useRef } from 'react';

export interface KitScriptEmbedProps {
  scriptUrl?: string;
  formId?: string;
  title?: string;
  embedType?: 'script' | 'iframe' | 'hosted';
}

/**
 * Client Component for Embedding Kit (ConvertKit) Forms & Script Embeds.
 *
 * @usecase Safely injects and executes Kit JS embeds or hosted Kit landing page URLs via iframe.
 * @param {KitScriptEmbedProps} props Embed parameters (scriptUrl, formId, embedType).
 * @returns {JSX.Element} Rendered container holding Kit embed element or iframe.
 */
export default function KitScriptEmbed({
  scriptUrl,
  formId,
  title,
  embedType = 'script',
}: KitScriptEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous elements
    containerRef.current.innerHTML = '';

    let cleanUrl = scriptUrl ? scriptUrl.trim() : null;
    let uid = formId ? formId.trim() : '';

    // If scriptUrl contains a raw <script ...> HTML tag string, parse out src and data-uid
    if (cleanUrl && cleanUrl.includes('<script')) {
      const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
      const uidMatch = cleanUrl.match(/data-uid=["']([^"']+)["']/i);
      if (srcMatch) cleanUrl = srcMatch[1];
      if (uidMatch && !uid) uid = uidMatch[1];
    }

    const targetUrl = cleanUrl || (uid ? `https://f.convertkit.com/${uid}/index.js` : null);

    if (!targetUrl) return;

    // Auto-detect if targetUrl is a direct hosted Kit landing page URL (e.g. https://glycosense.kit.com/1d0f3e3530 or *.ck.page)
    const isHostedKitPage =
      embedType === 'iframe' ||
      embedType === 'hosted' ||
      targetUrl.includes('.ck.page') ||
      (targetUrl.includes('.kit.com') && !targetUrl.endsWith('.js')) ||
      (!targetUrl.endsWith('.js') && !targetUrl.includes('<script'));

    if (isHostedKitPage) {
      // Ensure protocol
      let iframeSrc = targetUrl;
      if (!iframeSrc.startsWith('http://') && !iframeSrc.startsWith('https://')) {
        iframeSrc = `https://${iframeSrc}`;
      }

      const iframe = document.createElement('iframe');
      iframe.src = iframeSrc;
      iframe.className = 'w-full min-h-[750px] sm:min-h-[850px] border-0 rounded-3xl shadow-2xl bg-white';
      iframe.title = title || 'Kit Landing Page';
      iframe.allow = 'autoplay; fullscreen';
      containerRef.current.appendChild(iframe);
      return;
    }

    // Embed Script Tag for in-line forms
    const script = document.createElement('script');
    script.src = targetUrl;
    script.async = true;
    if (uid) {
      script.setAttribute('data-uid', uid);
    }
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [scriptUrl, formId, embedType, title]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div ref={containerRef} className="w-full max-w-5xl mx-auto" />
    </div>
  );
}
