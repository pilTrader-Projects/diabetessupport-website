'use client';

import React from 'react';
import NewsletterOptInForm from './NewsletterOptInForm';
import LeadMagnetCard from './LeadMagnetCard';
import { CAMPAIGN_CODES } from '@/config/leadConfig';

export interface BlogPostContentProps {
  content: string;
  slug: string;
}

/**
 * Client Component for rendering Blog Post HTML body content with live dynamic marketing widgets.
 *
 * @usecase Replaces marketing data-widget tags (e.g. data-widget="newsletter-optin") inside article content with live interactive React components.
 * @param {BlogPostContentProps} props Raw HTML content and post slug.
 * @returns {JSX.Element} Parsed HTML content containing live marketing forms and embeds.
 */
export default function BlogPostContent({ content, slug }: BlogPostContentProps) {
  if (!content) return null;

  // Regex matching <div ... data-widget="(kit-optin|newsletter-optin|lead-magnet|kit-embed)" ...> ... </div>
  const widgetRegex = /<div\s+[^>]*data-widget=["']([^"']+)["'][^>]*>(?:[\s\S]*?<\/div>)?/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = widgetRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const widgetType = match[1];
    const matchIndex = match.index;

    // Push preceding HTML chunk
    if (matchIndex > lastIndex) {
      const htmlChunk = content.substring(lastIndex, matchIndex);
      parts.push(
        <div
          key={`chunk-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: htmlChunk }}
        />
      );
    }

    // Helper to extract attribute values safely
    const getAttr = (name: string) => {
      const attrMatch = fullTag.match(new RegExp(`data-${name}=["']([^"']+)["']`, 'i'));
      return attrMatch ? attrMatch[1] : '';
    };

    const title = getAttr('title');
    const subtitle = getAttr('subtitle');
    const button = getAttr('button');
    const layout = getAttr('layout');

    if (widgetType === 'kit-optin' || widgetType === 'newsletter-optin') {
      parts.push(
        <div key={`widget-${matchIndex}`} className="my-8 not-prose">
          <NewsletterOptInForm
            title={title || 'Get Our Free Diabetes Care & Health Guide'}
            subtitle={subtitle}
            buttonText={button || 'Subscribe Free'}
            layout={(layout as any) || 'card'}
            source={CAMPAIGN_CODES.NEWSLETTER}
          />
        </div>
      );
    } else if (widgetType === 'lead-magnet' || widgetType === 'kit-embed') {
      parts.push(
        <div key={`widget-${matchIndex}`} className="my-8 not-prose">
          <LeadMagnetCard
            title={title || 'GlycoSense — Preventive Glucose & Lifestyle Intelligence App'}
            source={CAMPAIGN_CODES.COMPANION_APP_USERS}
          />
        </div>
      );
    }

    lastIndex = matchIndex + fullTag.length;
  }

  // Push remaining HTML chunk
  if (lastIndex < content.length) {
    const remainingChunk = content.substring(lastIndex);
    parts.push(
      <div
        key={`chunk-${lastIndex}`}
        dangerouslySetInnerHTML={{ __html: remainingChunk }}
      />
    );
  }

  return (
    <div className="prose prose-slate prose-teal max-w-none text-slate-800 text-base leading-relaxed space-y-6 [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h3]:text-xl [&>h3]:font-semibold [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6">
      {parts}
    </div>
  );
}
