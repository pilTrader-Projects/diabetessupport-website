import Link from 'next/link';

/**
 * Custom Branded 404 Not Found Page Component.
 *
 * @usecase Preserves crawl equity and provides clean navigation back to active articles and resources when users hit dead URLs.
 * @dependencies Next.js Link.
 * @returns {JSX.Element} Rendered 404 error page.
 */
export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
      <div className="space-y-4">
        <span className="bg-pink-100 text-pink-900 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full border border-pink-200 inline-block">
          404 Page Not Found
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
          Oops! That Page Has Moved or Doesn&apos;t Exist.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          The health guide or link you were looking for may have been updated, archived, or moved during our platform migration.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-slate-900">Explore Key Diabetes Resources Instead:</h2>
        <div className="flex flex-col gap-3 text-left">
          <Link
            href="/blog"
            className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-colors flex items-center justify-between font-bold text-sm text-slate-800 hover:text-teal-900"
          >
            <span>📚 Browse All Educational Articles</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/guides/cheatsheet"
            className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between font-bold text-sm text-slate-800 hover:text-amber-900"
          >
            <span>⚡ Download 7-Day Action Plan PDF</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/"
            className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between font-bold text-sm text-slate-800 hover:text-purple-900"
          >
            <span>🏠 Return to DiabetesCare PH Homepage</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
