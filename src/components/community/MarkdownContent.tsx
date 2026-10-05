'use client';

import React from 'react';

/**
 * Strips markdown symbols (#, *, _, [, ], `, >) from text for clean plain-text card previews.
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
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
 * Parses inline markdown (bold, italic, links, inline code) into React nodes.
 */
function parseInline(text: string): React.ReactNode[] {
  // Regex tokenizing links [text](url), bold **text**, italic *text*, and inline code `code`
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)|`([^`]+)`)/g;

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
      nodes.push(
        <a
          key={`link-${matchIndex}`}
          href={linkUrl}
          target={linkUrl.startsWith('http') ? '_blank' : undefined}
          rel={linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
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

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Community Discussion Markdown Renderer.
 *
 * @usecase Safely renders thread and reply markdown with responsive typography, headings, lists, and callout banners.
 */
export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content) return null;

  // Split into raw paragraph blocks separated by double newlines
  const rawBlocks = content.split(/\n\s*\n/);
  const elements: React.ReactNode[] = [];

  rawBlocks.forEach((block, blockIndex) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // 1. Horizontal Rules
    if (/^---+$|^\*\*\*+$/.test(trimmed)) {
      elements.push(
        <hr key={`hr-${blockIndex}`} className="my-8 border-t border-slate-200" />
      );
      return;
    }

    // 2. Headings
    if (trimmed.startsWith('#')) {
      const headingMatch = trimmed.match(/^(#{1,6})\s+([\s\S]*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2].trim();
        const inlineNodes = parseInline(headingText);

        // Special highlight card for Community Discussion prompt
        if (headingText.includes('Community Discussion') || headingText.includes('Peer Experiences')) {
          elements.push(
            <div
              key={`h-prompt-${blockIndex}`}
              className="mt-8 mb-4 p-5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 shadow-sm"
            >
              <h3 className="text-lg md:text-xl font-extrabold text-teal-950 flex items-center gap-2">
                {inlineNodes}
              </h3>
            </div>
          );
          return;
        }

        if (level === 1) {
          elements.push(
            <h1
              key={`h1-${blockIndex}`}
              className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-8 mb-3 tracking-tight leading-snug"
            >
              {inlineNodes}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2
              key={`h2-${blockIndex}`}
              className="text-xl md:text-2xl font-bold text-slate-900 mt-7 mb-3 tracking-tight leading-snug"
            >
              {inlineNodes}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3
              key={`h3-${blockIndex}`}
              className="text-lg md:text-xl font-bold text-slate-900 mt-6 mb-2.5 leading-snug"
            >
              {inlineNodes}
            </h3>
          );
        } else {
          elements.push(
            <h4
              key={`h4-${blockIndex}`}
              className="text-base md:text-lg font-bold text-slate-800 mt-5 mb-2 leading-snug"
            >
              {inlineNodes}
            </h4>
          );
        }
        return;
      }
    }

    // 3. Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/gm, '').trim();
      elements.push(
        <blockquote
          key={`quote-${blockIndex}`}
          className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50/50 rounded-r-lg text-slate-700 italic"
        >
          {parseInline(quoteText)}
        </blockquote>
      );
      return;
    }

    // 4. Unordered Lists (lines starting with - or *)
    const lines = trimmed.split('\n');
    const isUnorderedList = lines.every((line) => /^\s*[-*+]\s+/.test(line));
    if (isUnorderedList && lines.length > 0) {
      elements.push(
        <ul key={`ul-${blockIndex}`} className="list-disc list-outside pl-6 my-4 space-y-2 text-slate-700">
          {lines.map((line, liIndex) => {
            const itemText = line.replace(/^\s*[-*+]\s+/, '');
            return <li key={`li-${liIndex}`}>{parseInline(itemText)}</li>;
          })}
        </ul>
      );
      return;
    }

    // 5. Ordered Lists (lines starting with \d+.)
    const isOrderedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));
    if (isOrderedList && lines.length > 0) {
      elements.push(
        <ol key={`ol-${blockIndex}`} className="list-decimal list-outside pl-6 my-4 space-y-2 text-slate-700">
          {lines.map((line, liIndex) => {
            const itemText = line.replace(/^\s*\d+\.\s+/, '');
            return <li key={`oli-${liIndex}`}>{parseInline(itemText)}</li>;
          })}
        </ol>
      );
      return;
    }

    // 6. Regular Paragraphs
    elements.push(
      <p key={`p-${blockIndex}`} className="my-3 leading-relaxed text-slate-700 text-base md:text-lg">
        {parseInline(trimmed)}
      </p>
    );
  });

  return (
    <div className={`prose-headings:text-slate-900 prose-p:text-slate-700 ${className}`}>
      {elements}
    </div>
  );
}
