'use client';

import React from 'react';
import Link from 'next/link';
import { dispatchAffiliateCardClick } from '@/analytics/dispatchers/dispatchAffiliateCardClick';

export interface AffiliateLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  merchant?: string;
  label?: string;
  position?: string;
  showDisclosure?: boolean;
  disclosureText?: string;
  variant?: 'inline' | 'badge' | 'card' | 'plain';
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

/**
 * Standardized, FTC & Google AdSense compliant Affiliate Link component.
 *
 * Guarantees:
 * 1. Outbound rel="sponsored noopener noreferrer" compliance for all monetized links.
 * 2. Visible commercial disclosure indicator linking directly to /disclosure.
 * 3. Passive GA4 affiliate_card_click conversion telemetry dispatch.
 * 4. Safe new-window target isolation without hijacking UI modal state.
 */
export function AffiliateLink({
  href,
  merchant,
  label,
  position = 'inline',
  showDisclosure = true,
  disclosureText = 'affiliate link',
  variant = 'inline',
  className = '',
  containerClassName = '',
  children,
  onClick,
  ...rest
}: AffiliateLinkProps): React.JSX.Element {
  const detectedMerchant =
    merchant ||
    (href.includes('amazon') || href.includes('amzn.to')
      ? 'Amazon'
      : href.includes('shopee')
      ? 'Shopee'
      : href.includes('lazada')
      ? 'Lazada'
      : 'Partner');

  const itemName =
    label ||
    (typeof children === 'string' ? children : '') ||
    `${detectedMerchant} Recommendation`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    try {
      const pageLocation = typeof window !== 'undefined' ? window.location.pathname : '';
      dispatchAffiliateCardClick({
        page_location: pageLocation,
        affiliate_item: itemName,
        card_layout_position: position,
        destination_url: href,
      });
    } catch {
      // Passive telemetry should never block user navigation
    }
  };

  const anchorElement = (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
      data-click-type="affiliate_card"
      data-book-title={itemName}
      data-card-position={position}
      data-merchant={detectedMerchant}
      className={className}
      {...rest}
    >
      {children || label || href}
    </a>
  );

  // If disclosure is suppressed or plain variant requested
  if (!showDisclosure || variant === 'plain') {
    return anchorElement;
  }

  // Card layout variant (e.g. for card wrappers or grid items)
  if (variant === 'card') {
    return (
      <div className={`relative ${containerClassName}`}>
        {anchorElement}
        <div className="mt-1 flex items-center justify-end">
          <Link
            href="/disclosure"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-slate-400 hover:text-amber-400 dark:text-slate-400 dark:hover:text-amber-300 underline font-normal transition-colors"
            title="Read our commercial and affiliate disclosure policy"
          >
            {`(${disclosureText})`}
          </Link>
        </div>
      </div>
    );
  }

  // Badge variant (e.g. for pill chips or featured tags)
  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${containerClassName}`}>
        {anchorElement}
        <Link
          href="/disclosure"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/30 px-1.5 py-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-400/20 transition-colors"
          title="Read our commercial and affiliate disclosure policy"
        >
          {disclosureText}
        </Link>
      </span>
    );
  }

  // Default inline variant (e.g. within text paragraphs or list items)
  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${containerClassName}`}>
      {anchorElement}
      <Link
        href="/disclosure"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline font-normal tracking-tight transition-colors"
        title="Read our commercial and affiliate disclosure policy"
      >
        {`(${disclosureText})`}
      </Link>
    </span>
  );
}

export default AffiliateLink;
