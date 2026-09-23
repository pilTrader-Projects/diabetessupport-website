import React from 'react';

/**
 * Standardized Root Template for Next.js App Router.
 *
 * @usecase Mounts a fresh instance on every route transition to provide a consistent,
 * hardware-accelerated slide-up and fade-in page transition animation across all pages.
 * @param {Readonly<{ children: React.ReactNode }>} props Component props containing child route pages.
 * @returns {JSX.Element} Rendered template with page-transition-enter animation wrapper.
 */
export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="page-transition-enter w-full flex-grow">{children}</div>;
}
