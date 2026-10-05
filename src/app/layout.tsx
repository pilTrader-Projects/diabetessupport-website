import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { SITE_CONFIG } from '@/config/constants';
import { ExtensionGuard } from '@/components/ExtensionGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/ads/AdSenseScript';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import PwaRegister from '@/components/pwa/PwaRegister';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/schema';

/**
 * Mobile and PWA Viewport configuration object for Next.js App Router.
 * Configures theme color and device scale ergonomics for Android WebAPK and iOS Safari.
 */
export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Global Root Metadata configuration object for Next.js App Router.
 *
 * @usecase Configures site-wide metadataBase, title templates, OpenGraph, Twitter cards, PWA manifest, and icons.
 * @dependencies SITE_CONFIG constant object.
 */
export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_CONFIG.domain}`),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | Before the Numbers`,
  },
  description: SITE_CONFIG.description,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Before the Numbers',
  },
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: `https://${SITE_CONFIG.domain}`,
    siteName: SITE_CONFIG.author,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/**
 * Root Layout Component for Next.js App Router.
 *
 * @usecase Wraps all page components with consistent HTML head metadata, responsive header navigation, AdSense loader, ExtensionGuard, JSON-LD schemas, and footer.
 * @param {Readonly<{ children: React.ReactNode }>} props Component props containing child pages.
 * @dependencies SITE_CONFIG, ExtensionGuard, Header, AdSenseScript, globals.css.
 * @returns {JSX.Element} Rendered root HTML document structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = buildOrganizationSchema();
  const webSiteSchema = buildWebSiteSchema();

  return (
    <html lang="en">
      <head>
        {/* Preconnect to YouTube CDN edge servers for zero-stutter instant video streaming */}
        <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://googlevideo.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://googlevideo.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col max-w-full overflow-x-clip">
        <PwaRegister />
        <ExtensionGuard />
        <AdSenseScript />
        <GoogleAnalytics />
        <Header />

        <main className="flex-grow w-full max-w-full overflow-x-clip">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
