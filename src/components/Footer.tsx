import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

import { ALL_FOOTER_LINKS } from '@/config/trustConfig';

/**
 * Global Application Footer Component.
 *
 * @usecase Renders global footer navigation including newly deployed E-E-A-T trust pages
 * (/editorial-policy, /corrections), medical disclaimers, and realigned privacy notice.
 */
export default function Footer() {
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

        <p className="font-bold text-white tracking-wide">
          © {new Date().getFullYear()} {SITE_CONFIG.author}. All rights reserved.
        </p>
        <p className="max-w-3xl mx-auto text-xs text-purple-200/80 leading-relaxed">
          <strong className="text-white">Medical Disclaimer:</strong> Before the Numbers is an independent health awareness and educational movement. Content provided on this site is for informational and educational purposes only and must not be used as medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding your individual health conditions.
        </p>
        <p className="max-w-3xl mx-auto text-xs text-purple-200/80 leading-relaxed">
          <strong className="text-white">Data Privacy &amp; Security Notice:</strong> Health bookmarks and preferences are stored locally on your device via browser localStorage, and cross-device synchronization uses an ephemeral 6-digit PIN with zero health records stored on a central server. In the Philippines, data handling adheres to Republic Act No. 10173 (Philippine Data Privacy Act of 2012). We never sell, rent, or disclose your personal information to third parties, advertisers, or insurers.
        </p>
      </div>
    </footer>
  );
}
