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
        <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2 font-bold text-xl text-teal-400">
              <span>🩸 DiabetesCare PH</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="/blog" className="hover:text-teal-300 transition-colors">Blog Articles</a>
              <a href="/apps" className="hover:text-teal-300 transition-colors">PWA Companion Tools</a>
              <a href="/about" className="hover:text-teal-300 transition-colors">About Us</a>
            </nav>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            <p>© {new Date().getFullYear()} {SITE_CONFIG.author}. All rights reserved.</p>
            <p className="mt-2 text-xs text-slate-500">
              Disclaimer: The information provided on DiabetesCare PH is for educational purposes only and should not replace professional medical advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
