import { Metadata } from 'next';
import Link from 'next/link';
import { CORRECTIONS_LOG } from '@/config/trustConfig';

export const metadata: Metadata = {
  title: 'Editorial Corrections Policy & Change Log | Before the Numbers',
  description:
    'Our public correction policy, error submission procedures, 24-48 hour triage timeframe, and transparent change log of editorial revisions.',
  alternates: {
    canonical: '/corrections',
  },
};

/**
 * Editorial Corrections Policy Page Component.
 *
 * @usecase Documents correction procedures, error submission contact, triage response times,
 * and maintains a public log of editorial and scientific adjustments for Google E-E-A-T.
 */
export default function CorrectionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      {/* Header */}
      <header className="space-y-4 text-center sm:text-left border-b border-slate-200 pb-8">
        <span className="bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-200 inline-block shadow-sm">
          Accountability &amp; Transparency
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Editorial Corrections Policy
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          We hold our educational content to the highest standards of scientific rigor.
          When errors or ambiguities occur, we promptly investigate, correct, and document them publicly.
        </p>
      </header>

      {/* Commitment to Accuracy */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>🎯</span> Commitment to Accuracy &amp; Scientific Integrity
        </h2>
        <p>
          Before the Numbers is dedicated to publishing factual, up-to-date metabolic education.
          If we make a factual mistake, cite outdated clinical guidelines, or use language that could be misinterpreted,
          we commit to correcting the record transparently rather than quietly altering text without acknowledgment.
        </p>
      </section>

      {/* How to Report an Inaccuracy */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📬</span> How to Report an Inaccuracy
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Readers, healthcare professionals, and researchers who spot potential inaccuracies or outdated citations are encouraged to notify our editorial desk immediately:
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2">
          <p>
            <strong>Direct Email:</strong>{' '}
            <a
              href="mailto:corrections@beforethenumbers.org"
              className="text-indigo-600 font-bold underline hover:text-indigo-800"
            >
              corrections@beforethenumbers.org
            </a>
          </p>
          <p className="text-slate-500">
            Please include: (1) The page URL, (2) The specific statement in question, and (3) Primary literature or official guidelines supporting the correction.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          <strong>Review Turnaround:</strong> Our clinical and editorial team reviews incoming reports within <strong>24 to 48 hours</strong>. If a correction is warranted, updates are published immediately and recorded in the change log below.
        </p>
      </section>

      {/* Public Change Log */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📝</span> Public Editorial Change Log
          </h2>
          <p className="text-xs text-slate-500 pt-1">
            Chronological record of notable factual corrections, medical hedging revisions, and structural updates across our platform.
          </p>
        </div>

        <div className="space-y-4">
          {CORRECTIONS_LOG.map((entry, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {entry.type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{entry.pageTitle}</h3>
                </div>
                <span className="text-xs font-medium text-slate-500">{entry.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{entry.description}</p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Page: <code>{entry.pageUrl}</code></span>
                <span>Reviewed by: <strong>{entry.reviewedBy}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-indigo-700">
        <Link href="/editorial-policy" className="hover:underline">&larr; Read Editorial Policy</Link>
        <Link href="/medical-review-board" className="hover:underline">Meet the Medical Review Board &rarr;</Link>
        <Link href="/about" className="hover:underline">Back to About Us &rarr;</Link>
      </div>
    </div>
  );
}
