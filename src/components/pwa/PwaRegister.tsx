'use client';

import { useEffect } from 'react';

/**
 * Client-Side PWA Service Worker Registration Component.
 *
 * @usecase Registers the root service worker (/sw.js) upon window load to qualify for
 * Android WebAPK generation, PWA install prompt triggers, and offline fallback caching.
 * @dependencies navigator.serviceWorker API.
 * @returns {null} Renders nothing directly into the DOM hierarchy.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
        }

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('[PWA] New content is available; please refresh.');
                }
              }
            });
          }
        });
      } catch (err) {
        console.error('[PWA] Service Worker registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);

  return null;
}
