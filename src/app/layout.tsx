import type { Metadata } from 'next';
import './globals.css';
import { SITE_CONFIG } from '@/config/constants';
import { ExtensionGuard } from '@/components/ExtensionGuard';
import Link from 'next/link';

/**
 * Next.js Metadata configuration object.
 * @usecase Configures site title and meta description for SEO indexers.
 * @dependencies SITE_CONFIG constant object.
 */
export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
};

/**
 * Root Layout Component for Next.js App Router.
 *
 * @usecase Wraps all page components with consistent HTML head metadata, header navigation, ExtensionGuard, and footer.
 * @param {Readonly<{ children: React.ReactNode }>} props Component props containing child pages.
 * @dependencies SITE_CONFIG, ExtensionGuard, globals.css.
 * @returns {JSX.Element} Rendered root HTML document structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <ExtensionGuard />
        <header className="bg-gradient-to-r from-blue-900 via-purple-950 to-pink-950 text-white sticky top-0 z-50 shadow-xl border-b border-white/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 font-black text-xl text-white tracking-tight hover:opacity-90 transition-opacity">
              <span className="text-2xl">🩸</span>
              <span className="bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">DiabetesCare PH</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-semibold">
              <Link href="/#progression" className="text-purple-100 hover:text-white transition-colors">Progression & Metrics</Link>
              <Link href="/#education" className="text-purple-100 hover:text-white transition-colors">Educational Articles</Link>
              <Link href="/#awareness" className="text-purple-100 hover:text-white transition-colors">The Silent Killer</Link>
              <Link href="/#campaign" className="bg-white/15 hover:bg-white text-white hover:text-indigo-900 font-bold px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-md transition-all shadow-sm">Take Action</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="bg-gradient-to-r from-blue-900 via-purple-950 to-pink-950 text-white py-12 border-t border-white/10 mt-16 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="font-bold text-white tracking-wide">© {new Date().getFullYear()} {SITE_CONFIG.author}. All rights reserved.</p>
            <p className="max-w-3xl mx-auto text-xs text-purple-200/80 leading-relaxed">
              Medical Disclaimer: DiabetesCare PH is an independent health awareness and educational campaign platform. Content provided on this site is for informational and educational purposes only and must not be used as medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding your health conditions.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
