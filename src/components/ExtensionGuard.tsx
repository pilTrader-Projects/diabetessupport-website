'use client';

import { useEffect } from 'react';

/**
 * Client Guard Component suppressing third-party browser extension runtime errors (e.g. MetaMask).
 *
 * @usecase Prevents browser extension unhandled promise rejections from popping up in Next.js dev error overlays.
 * @param None Component takes no props.
 * @dependencies react useEffect hook.
 * @returns {null} Renderless utility component.
 */
export function ExtensionGuard(): null {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event.reason?.message || event.reason || '');
      const stackStr = String(event.reason?.stack || '');

      if (
        reasonStr.includes('MetaMask') ||
        reasonStr.includes('Failed to connect to MetaMask') ||
        stackStr.includes('chrome-extension://') ||
        stackStr.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
