import React from 'react';

export interface SponsoredBadgeProps {
  slug: string;
  sponsorName?: string;
  className?: string;
}

/**
 * Sponsored Content & Commercial Partner Disclosure Badge.
 *
 * @usecase Renders standardized, high-contrast disclosure badge across public catalog
 *          cards (videos, studies, podcasts, books) to ensure full compliance with
 *          advertising transparency guidelines and medical educational neutrality.
 */
export default function SponsoredBadge({
  slug,
  sponsorName,
  className = '',
}: SponsoredBadgeProps): React.JSX.Element {
  const label = sponsorName ? `Sponsored by ${sponsorName}` : 'Sponsored Content';

  return (
    <span
      data-testid={`sponsored-badge-${slug}`}
      className={`bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs ${className}`}
    >
      <span aria-hidden="true">★</span>
      <span>{label}</span>
    </span>
  );
}
