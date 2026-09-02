'use client';

import Image from 'next/image';
import { AWARENESS_PILLARS } from '@/config/constants';

/**
 * Main Diabetes Educational & Awareness Campaign Home Page Component.
 *
 * @usecase Exposes the sneaky nature of diabetes as a silent killer that thrives in the status quo, delivering compelling education and awareness.
 * @param None Page component receives no props.
 * @dependencies AWARENESS_PILLARS constants, next/image.
 * @returns {JSX.Element} Rendered high-impact awareness landing page.
 */
export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Awareness Banner */}
      <section className="gradient-hero text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-block bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-rose-400/30">
              🚨 Public Health Awareness Campaign
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Diabetes Is a <span className="text-rose-400 underline decoration-rose-500/50">Silent Killer</span>. It Thrives in the Status Quo.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              Nearly <strong>1 in 2 adults</strong> living with high blood sugar don’t even know it. Because early diabetes causes no pain, millions drift in complacency while irreversible vascular and organ damage quietly accumulates.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="#awareness"
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-lg font-bold shadow-lg hover:shadow-rose-600/25 transition-all text-sm"
              >
                Unmask the Hidden Warning Signs
              </a>
              <a
                href="#progression"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3.5 rounded-lg font-semibold border border-slate-700 transition-all text-sm"
              >
                How Diabetes Stealthily Develops &rarr;
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900/60 p-2">
            <Image
              src="/images/hero-awareness.png"
              alt="Diabetes Awareness Monitoring & Digital Metrics Graphic"
              width={800}
              height={800}
              className="rounded-xl object-cover w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Awareness Pillars Grid */}
      <section id="awareness" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Diabetes Thrives in Status Quo Neglect
          </h2>
          <p className="text-slate-600 text-lg">
            Understanding the stealth nature of insulin resistance is your first defense against permanent vascular damage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AWARENESS_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="glass-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-200/80 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{pillar.icon}</span>
                  <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-200">
                    {pillar.stat}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-sm font-semibold text-teal-700">{pillar.subtitle}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Silent Progression Infographic Section */}
      <section id="progression" className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">
              Visualizing the Biological Threat
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The Path from Insulin Resistance to Vascular Damage
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Type 2 diabetes does not happen overnight. It begins years earlier when cells resist insulin action, forcing the pancreas to work overtime until blood sugar overflows into micro-vessels.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-2xl">🩸</span>
                <div>
                  <h4 className="font-bold text-teal-300 text-base">Stage 1: Silent Hyperglycemia</h4>
                  <p className="text-xs text-slate-400">Glucose accumulates in circulation while standard blood tests seem borderline normal.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-bold text-rose-300 text-base">Stage 2: Micro-Vascular Erosion</h4>
                  <p className="text-xs text-slate-400">High sugar levels irritate vessel linings, contributing to nerve damage, kidney strain, and retinal harm.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h4 className="font-bold text-amber-300 text-base">Stage 3: Immediate Intervention</h4>
                  <p className="text-xs text-slate-400">Targeted nutrition, physical activity, and fasting glucose monitoring halt progression before complications set in.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 p-2">
            <Image
              src="/images/silent-killer.png"
              alt="The Silent Progression of Type 2 Diabetes Infographic"
              width={800}
              height={800}
              className="rounded-xl object-cover w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Subtle Symptoms & Warning Signs */}
      <section id="education" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Subtle Warning Signs Most People Ignore
          </h2>
          <p className="text-slate-600 text-base">
            Don’t wait for severe symptoms. If you experience two or more of these subtle red flags, get tested immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">🚰</div>
            <h3 className="font-bold text-slate-900 text-lg">Unquenchable Thirst</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Excess sugar in the bloodstream pulls water from tissues, leaving you constantly thirsty despite drinking liquids.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">💤</div>
            <h3 className="font-bold text-slate-900 text-lg">Chronic Unexplained Fatigue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When cells cannot absorb glucose properly, your body is starved of basic cellular energy despite adequate sleep.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">👁️</div>
            <h3 className="font-bold text-slate-900 text-lg">Blurry Vision Spells</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fluctuating blood sugar distorts the eye lenses, causing intermittent blurred vision that comes and goes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">🩹</div>
            <h3 className="font-bold text-slate-900 text-lg">Slow Healing Cuts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Impaired blood circulation and high glucose compromise the body natural wound repair and immune response.
            </p>
          </div>
        </div>
      </section>

      {/* Campaign Call-to-Action Lead Capture */}
      <section id="campaign" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="gradient-hero text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl border border-slate-800">
          <span className="text-teal-300 text-xs font-bold uppercase tracking-widest bg-teal-900/60 px-3 py-1 rounded-full border border-teal-500/30">
            Join the Diabetes Awareness Movement
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Break the Status Quo. Protect Yourself & Loved Ones.
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Subscribe to receive our evidence-based diabetes educational guides, HbA1c screening cheat sheets, and dietary guidance.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="px-4 py-3 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 flex-grow"
            />
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-md"
            >
              Get Free Guides
            </button>
          </form>
          <p className="text-xs text-slate-400">100% free educational resources. No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
