import React from 'react';

/**
 * Validates and sanitizes a URL to prevent cross-site scripting (XSS) via javascript:, vbscript:, or data: URIs.
 *
 * @usecase Guarantees that any markdown link parsed from user or founder content only navigates to trusted protocols.
 * @param {string} url The raw URL candidate string from markdown syntax.
 * @dependencies None. Pure URL protocol validation.
 * @returns {string} Sanitized URL safe for href attribute, or '#' if disallowed.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '#';
  }

  // Allow internal relative paths
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow standard safe web protocols
  const safeProtocolRegex = /^(https?|mailto|tel):/i;
  if (safeProtocolRegex.test(trimmed)) {
    return trimmed;
  }

  // Neutralize dangerous schemes (javascript:, vbscript:, data:)
  return '#';
}

/**
 * Strips markdown symbols (#, *, _, [, ], `, >) from text for clean plain-text card previews.
 *
 * @usecase Transforms markdown body content into concise, readable plain text for forum feed previews.
 * @param {string} text Raw markdown or mixed HTML string.
 * @dependencies None. Regular expression text sanitization.
 * @returns {string} Plain text without formatting markers.
 */
export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/<[^>]*>?/gm, '') // Strip any HTML tags
    .replace(/^#{1,6}\s+/gm, '') // Strip heading markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Strip bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Strip italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip links leaving link text
    .replace(/`([^`]+)`/g, '$1') // Strip inline code
    .replace(/^\s*[-*+]\s+/gm, '') // Strip list bullets
    .replace(/^\s*\d+\.\s+/gm, '') // Strip ordered list numbers
    .replace(/^\s*>\s*/gm, '') // Strip blockquotes
    .replace(/---+/g, '') // Strip horizontal rules
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Parses inline markdown (bold, italic, links, inline code) into an array of React nodes.
 *
 * @usecase Renders rich inline typography safely without relying on dangerouslySetInnerHTML.
 * @param {string} text Plain text containing inline markdown markers.
 * @dependencies React, sanitizeUrl.
 * @returns {React.ReactNode[]} Array of React elements and text strings.
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text || typeof text !== 'string') {
    return [''];
  }

  // Regex tokenizing links [text](url), bold **text**, italic *text*, and inline code `code`
  const tokenRegex =
    /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)|`([^`]+)`)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      nodes.push(text.substring(lastIndex, matchIndex));
    }

    const [fullMatch, , linkText, linkUrl, bold1, bold2, italic1, italic2, code] = match;

    if (linkText && linkUrl) {
      const safeHref = sanitizeUrl(linkUrl);
      const isExternal = safeHref.startsWith('http');

      nodes.push(
        <a
          key={`link-${matchIndex}`}
          href={safeHref}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-teal-700 font-semibold underline hover:text-teal-900 transition-colors"
        >
          {linkText}
        </a>
      );
    } else if (bold1 || bold2) {
      nodes.push(
        <strong key={`bold-${matchIndex}`} className="font-bold text-slate-900">
          {bold1 || bold2}
        </strong>
      );
    } else if (italic1 || italic2) {
      nodes.push(
        <em key={`italic-${matchIndex}`} className="italic">
          {italic1 || italic2}
        </em>
      );
    } else if (code) {
      nodes.push(
        <code
          key={`code-${matchIndex}`}
          className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200"
        >
          {code}
        </code>
      );
    } else {
      nodes.push(fullMatch);
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}
