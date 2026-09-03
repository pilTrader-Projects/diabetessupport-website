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
 * @usecase Safely injects and executes external Kit JavaScript embed script tags dynamically.
 * @param {KitScriptEmbedProps} props Embed parameters (scriptUrl, formId, embedType).
 * @returns {JSX.Element} Rendered container holding Kit embed element.
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

    if (embedType === 'iframe' || targetUrl.includes('.ck.page')) {
      const iframe = document.createElement('iframe');
      iframe.src = targetUrl;
      iframe.className = 'w-full min-h-[600px] border-0 rounded-2xl shadow-sm';
      iframe.title = title || 'Kit Form';
      containerRef.current.appendChild(iframe);
      return;
    }

    // Embed Script Tag
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
    <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
      <div ref={containerRef} className="w-full max-w-3xl mx-auto" />
    </div>
  );
}
