import type { MetadataRoute } from 'next';

/**
 * Web App Manifest generator for Next.js App Router.
 *
 * @usecase Generates standard /manifest.webmanifest route supplying mandatory metadata
 * required for Android WebAPK creation, home-screen installation, and desktop PWA support.
 * @returns {MetadataRoute.Manifest} Full PWA manifest configuration.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DiabetesCare PH — Blood Sugar Tracking & Care Portal',
    short_name: 'DiabetesCare',
    description:
      'Protect your health and family income. Track blood glucose trends, food intake, and reverse insulin resistance with GlycoSense.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1e3a8a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['medical', 'health', 'lifestyle'],
    lang: 'en-PH',
  };
}
