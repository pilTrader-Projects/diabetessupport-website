import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SITE_CONFIG } from '@/config/constants';
import { ExtensionGuard } from '@/components/ExtensionGuard';
import Header from '@/components/Header';
import AdSenseScript from '@/components/ads/AdSenseScript';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/schema';

/**
 * Global Root Metadata configuration object for Next.js App Router.
 *
 * @usecase Configures site-wide metadataBase, title templates, OpenGraph, Twitter cards, and canonical alternates.
 * @dependencies SITE_CONFIG constant object.
 */
export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_CONFIG.domain}`),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | DiabetesCare PH`,
  },
  description: SITE_CONFIG.description,
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: `https://${SITE_CONFIG.domain}`,
    siteName: SITE_CONFIG.title,
    locale: 'en_PH',
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
    <html lang="en" className="scroll-smooth">
      <head>
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
        <ExtensionGuard />
        <AdSenseScript />
        <Header />

        <main className="flex-grow w-full max-w-full overflow-x-clip">{children}</main>

        <footer className="bg-gradient-to-r from-blue-900 via-purple-950 to-pink-950 text-white py-14 border-t border-white/10 mt-16 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* Quick Links Navigation */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-purple-200 uppercase tracking-wider">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Educational Articles</Link>
              <Link href="/guides/cheatsheet" className="hover:text-white transition-colors">7-Day Plan PDF</Link>
              <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>

            <p className="font-bold text-white tracking-wide">
              © {new Date().getFullYear()} {SITE_CONFIG.author}. All rights reserved.
            </p>
            <p className="max-w-3xl mx-auto text-xs text-purple-200/80 leading-relaxed">
              <strong className="text-white">Medical Disclaimer:</strong> DiabetesCare PH is an independent health awareness and educational campaign platform. Content provided on this site is for informational and educational purposes only and must not be used as medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding your health conditions.
            </p>
            <p className="max-w-3xl mx-auto text-xs text-purple-200/80 leading-relaxed">
              <strong className="text-white">Data Privacy & Security Notice:</strong> Health metrics and logs entered into GlycoSense are treated as Sensitive Personal Information under Republic Act No. 10173 (Philippine Data Privacy Act of 2012). Data is encrypted, strictly owned by you, and utilized exclusively for generating your personal summaries and doctor-ready reports. We never sell, rent, or disclose your health data to third parties, advertisers, or insurers.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
