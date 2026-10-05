import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Editorial Policy & Standards | Before the Numbers',
  description:
    'Our strict sourcing criteria, peer-review standards, conflict of interest safeguards, and 12-month re-review cycle ensuring scientific rigor and integrity.',
  alternates: {
    canonical: '/editorial-policy',
  },
};

/**
 * Editorial Policy Page Component.
 *
 * @usecase Documents editorial integrity, rigorous sourcing criteria, medical review workflow,
 * commercial independence, and 12-month review cycle for Google E-E-A-T trust compliance.
 */
export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      {/* Header */}
      <header className="space-y-4 text-center sm:text-left border-b border-slate-200 pb-8">
        <span className="bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-200 inline-block shadow-sm">
          Integrity &amp; Standards
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Editorial Policy &amp; Standards
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          How Before the Numbers evaluates, synthesizes, and medically reviews metabolic health science
          to empower families with trustworthy, evidence-grounded education.
        </p>
      </header>

      {/* Sourcing Standards */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>🔬</span> Evidence-First Sourcing Criteria
        </h2>
        <p>
          Before the Numbers does not publish unverified wellness opinions or unhedged cure claims. All educational
          materials, curated lectures, and visual infographics are synthesized strictly from high-integrity medical literature:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="text-indigo-600">✓</span> Peer-Reviewed Journals
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Studies indexed in PubMed, MEDLINE, and major international peer-reviewed journals including <em>The Lancet</em>, <em>The New England Journal of Medicine</em>, <em>Diabetes Care</em>, and <em>Cell Metabolism</em>.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="text-indigo-600">✓</span> Consensus Guidelines
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized clinical practice guidelines from major endocrinology bodies including the American Diabetes Association (ADA), European Association for the Study of Diabetes (EASD), and International Diabetes Federation (IDF).
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="text-indigo-600">✓</span> Official Public Health Registries
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authoritative epidemiological registries including the Philippine Statistics Authority (PSA), DOST-FNRI National Nutrition Surveys, and Philippine Department of Health (DOH).
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="text-rose-600">✕</span> Strict Exclusions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We strictly reject and exclude sponsored pharmaceutical whitepapers, multi-level marketing (MLM) supplements, predatory journals, and unsubstantiated anecdotal testimonies.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Layer Review Workflow */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-indigo-50/60 p-6 sm:p-8 rounded-2xl border border-indigo-100">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>🛡️</span> 3-Layer Curation &amp; Medical Review Workflow
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Every educational resource on our platform passes through three rigorous layers of validation before public indexing:
        </p>
        <ol className="space-y-3 text-xs sm:text-sm text-slate-700 list-decimal list-inside">
          <li>
            <strong>Layer 1 — Primary Authority:</strong> Identifying lectures, trials, or research led by recognized researchers and clinicians (e.g., Dr. Benjamin Bikman, Dr. Jason Fung).
          </li>
          <li>
            <strong>Layer 2 — Editorial Desk Synthesis:</strong> Synthesizing key biochemical mechanisms, creating answer-first 10-second summaries, and formulating doctor consultation questions.
          </li>
          <li>
            <strong>Layer 3 — Clinical Safety Review:</strong> Independent review by our <Link href="/medical-review-board" className="text-indigo-700 font-bold underline hover:text-indigo-900">Medical Review Board</Link> to ensure clinical accuracy, proper scientific hedging, and mandatory safety caveats.
          </li>
        </ol>
      </section>

      {/* Conflict of Interest & Commercial Independence */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>⚖️</span> Conflict of Interest &amp; Commercial Independence
        </h2>
        <p>
          Our highest priority is maintaining absolute trust with our community. We enforce strict organizational independence:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 list-disc list-inside">
          <li>
            <strong>Zero Pharmaceutical Sponsorship:</strong> We do not accept financial compensation, grants, or sponsorships from pharmaceutical manufacturers to promote or favor specific prescription medications.
          </li>
          <li>
            <strong>Editorial Firewalls:</strong> Advertisers have no input or influence over content creation, editorial topics, curation selections, or scientific assessments.
          </li>
          <li>
            <strong>Affiliate Transparency:</strong> Contextual book and tool links (e.g., books authored by cited researchers) are clearly labeled with transparent affiliate disclosures. Any modest commission earned is reinvested in hosting and open-access public health resources.
          </li>
        </ul>
      </section>

      {/* 12-Month Review Cycle */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-slate-100 p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🔄</span> 12-Month Scheduled Review Cycle
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Metabolic science and clinical nutrition guidelines evolve rapidly. Before the Numbers subjects all core guides, curated resources, and frameworks to a <strong>12-Month Scheduled Review Cycle</strong>. Every resource is re-evaluated by our editorial and clinical team at least once per year to ensure ongoing scientific consensus.
        </p>
      </section>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-indigo-700">
        <Link href="/medical-review-board" className="hover:underline">Meet the Medical Review Board &rarr;</Link>
        <Link href="/corrections" className="hover:underline">View Public Corrections Policy &rarr;</Link>
        <Link href="/contact" className="hover:underline">Contact Editorial Team &rarr;</Link>
      </div>
    </div>
  );
}
