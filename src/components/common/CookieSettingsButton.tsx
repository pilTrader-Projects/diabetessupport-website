'use client';

import React from 'react';
import { openConsentPreferences } from '@/lib/consent';

interface CookieSettingsButtonProps {
  className?: string;
  label?: string;
}

/**
 * Interactive Client Button triggering the Cookie Consent Preferences Modal.
 *
 * @usecase Embeds within the server-rendered application Footer, allowing users
 * to revisit and adjust their cookie settings at any time (DPA RA 10173 & ePrivacy requirement).
 */
export default function CookieSettingsButton({
  className = 'hover:text-white transition-colors text-xs font-bold text-purple-200 uppercase tracking-wider',
  label = 'Cookie Settings',
}: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      id="footer-cookie-settings-btn"
      onClick={() => openConsentPreferences()}
      className={className}
      aria-label="Open cookie preferences and consent modal"
    >
      {label}
    </button>
  );
}
