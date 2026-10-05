import { Metadata } from 'next';
import Link from 'next/link';
import { MEDICAL_REVIEW_BOARD_MEMBERS } from '@/config/trustConfig';

export const metadata: Metadata = {
  title: 'Medical Review Board & Clinical Governance | Before the Numbers',
  description:
    'Meet the licensed physicians and clinical advisors who review, medically hedge, and validate all health content on Before the Numbers.',
  alternates: {
    canonical: '/medical-review-board',
  },
};

/**
 * Medical Review Board Page Component.
 *
 * @usecase Displays licensed medical reviewers, verifiable regulatory credentials (PRC),
 * jurisdictions, clinical review scope, and non-prescriptive medical disclaimers for Google E-E-A-T.
 */
export default function MedicalReviewBoardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      {/* Header */}
      <header className="space-y-4 text-center sm:text-left border-b border-slate-200 pb-8">
        <span className="bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-200 inline-block shadow-sm">
          Clinical Governance &amp; Expert Oversight
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Medical Review Board
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          Licensed physicians and clinical reviewers ensuring every educational synthesis, guide,
          and safety callout adheres to medical truth and clinical safety.
        </p>
      </header>

      {/* Reviewer Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>🩺</span> Licensed Clinical Reviewers
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {MEDICAL_REVIEW_BOARD_MEMBERS.map((reviewer) => (
            <div
              key={reviewer.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{reviewer.name}</h3>
                  <p className="text-xs font-bold text-indigo-700 tracking-wide">{reviewer.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-200">
                    {reviewer.prcLicenseNo}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                    Verified Physician
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-900">Credentials &amp; Fellowship:</strong> {reviewer.credentials}
                </p>
                <p>
                  <strong className="text-slate-900">Regulatory Jurisdiction:</strong> {reviewer.licenseJurisdiction}
                </p>
                <p>
                  <strong className="text-slate-900">Clinical Focus:</strong> {reviewer.specialty}
                </p>
                <p className="pt-2 text-slate-700 leading-relaxed">{reviewer.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scope of Medical Review */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>📋</span> Scope of Medical Review
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The Medical Review Board performs structured pre-publication reviews focusing on:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside">
          <li>
            <strong>Factual Accuracy &amp; Safety Caveats:</strong> Validating that biological pathways, biomarker ranges, and lifestyle discussions accurately reflect medical consensus.
          </li>
          <li>
            <strong>Medication Interaction Precautions:</strong> Mandating prominent emergency safety notices for patients taking exogenous insulin or sulfonylureas who may risk severe hypoglycemia during dietary shifts.
          </li>
          <li>
            <strong>Non-Prescriptive Educational Framing:</strong> Ensuring no content is phrased as direct personal medical advice, personalized dosing, or diagnostic verdicts.
          </li>
        </ul>
      </section>

      {/* Disclaimers */}
      <section className="p-6 rounded-2xl border border-amber-200 bg-amber-50 text-xs sm:text-sm text-amber-950 space-y-2 leading-relaxed">
        <h3 className="font-extrabold text-amber-900 uppercase tracking-wider text-xs">
          ⚠️ Important Notice: No Doctor-Patient Relationship
        </h3>
        <p>
          The Medical Review Board acts solely in an editorial advisory capacity. Review of content by licensed physicians does not constitute a doctor-patient relationship, clinical consultation, diagnosis, or personalized treatment plan. Always seek the advice of your personal physician or qualified healthcare provider with any questions regarding medical conditions.
        </p>
      </section>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-indigo-700">
        <Link href="/editorial-policy" className="hover:underline">&larr; Read Editorial Policy</Link>
        <Link href="/corrections" className="hover:underline">Report an Inaccuracy &rarr;</Link>
        <Link href="/about" className="hover:underline">About Our Mission &rarr;</Link>
      </div>
    </div>
  );
}
