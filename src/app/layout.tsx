import type { Metadata } from 'next';
import './globals.css';
import { SITE_CONFIG } from '@/config/constants';
import { ExtensionGuard } from '@/components/ExtensionGuard';
import Header from '@/components/Header';

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
 * @usecase Wraps all page components with consistent HTML head metadata, responsive header navigation, ExtensionGuard, and footer.
 * @param {Readonly<{ children: React.ReactNode }>} props Component props containing child pages.
 * @dependencies SITE_CONFIG, ExtensionGuard, Header, globals.css.
 * @returns {JSX.Element} Rendered root HTML document structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col max-w-full overflow-x-clip">
        <ExtensionGuard />
        <Header />

        <main className="flex-grow w-full max-w-full overflow-x-clip">{children}</main>

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
