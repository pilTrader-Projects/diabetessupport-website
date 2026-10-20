import React from 'react';
import Link from 'next/link';

import { ALL_FOOTER_LINKS } from '@/config/trustConfig';
import { getLegalDocument } from '@/lib/legalContent';
import { parseLegalBlocks } from '@/components/legal/LegalMarkdown';
import { parseInlineMarkdown } from '@/lib/markdownUtils';

/**
 * Global Application Footer Component.
 *
 * @usecase Renders global footer navigation including newly deployed E-E-A-T trust pages
 * (/editorial-policy, /corrections), medical disclaimers, and realigned privacy notice.
 * The copyright line and notices are edited in src/content/legal/footer.md (no code change needed).
 */
export default function Footer() {
  const { meta, body } = getLegalDocument('footer');
  const notices = parseLegalBlocks(body).flatMap((block) => (block.type === 'p' ? [block.text] : []));

  return (
    <footer className="bg-gradient-to-r from-blue-900 via-purple-950 to-pink-950 text-white py-14 border-t border-white/10 mt-16 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Quick Links Navigation */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-purple-200 uppercase tracking-wider">
          {ALL_FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {meta.copyright && <p className="font-bold text-white tracking-wide">{meta.copyright}</p>}
        {notices.map((text, i) => (
          <p
            key={i}
            className="max-w-3xl mx-auto text-xs text-purple-200/80 leading-relaxed [&_strong]:text-white"
          >
            {parseInlineMarkdown(text)}
          </p>
        ))}
      </div>
    </footer>
  );
}
