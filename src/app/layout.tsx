import type { Metadata } from 'next';
import './globals.css';
import { SITE_CONFIG } from '@/config/constants';

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
 * @usecase Wraps all page components with consistent HTML head metadata, header navigation, and footer.
 * @param {Readonly<{ children: React.ReactNode }>} props Component props containing child pages.
 * @dependencies SITE_CONFIG, globals.css.
 * @returns {JSX.Element} Rendered root HTML document structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2 font-bold text-xl text-teal-400">
              <span className="text-2xl">🩸</span>
              <span className="tracking-tight">DiabetesCare PH</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="#awareness" className="hover:text-teal-300 transition-colors">The Silent Killer</a>
              <a href="#progression" className="hover:text-teal-300 transition-colors">Progression</a>
              <a href="#education" className="hover:text-teal-300 transition-colors">Educational Articles</a>
              <a href="#campaign" className="hover:text-teal-300 transition-colors">Take Action</a>
            </nav>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="font-semibold text-slate-300">© {new Date().getFullYear()} {SITE_CONFIG.author}. All rights reserved.</p>
            <p className="max-w-3xl mx-auto text-xs text-slate-500 leading-relaxed">
              Medical Disclaimer: DiabetesCare PH is an independent health awareness and educational campaign platform. Content provided on this site is for informational and educational purposes only and must not be used as medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding your health conditions.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
