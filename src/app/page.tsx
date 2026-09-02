import { SITE_CONFIG, PWA_APPS } from '@/config/constants';

/**
 * Main Home Page Component.
 *
 * @usecase Displays Hero section, value proposition, and PWA companion application showcase grid.
 * @param None Page component receives no props.
 * @dependencies SITE_CONFIG, PWA_APPS constants.
 * @returns {JSX.Element} Rendered homepage layout.
 */
export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="gradient-hero text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-400/30">
            Empowering Diabetic Wellness
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Your Comprehensive Companion for Diabetes Management
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {SITE_CONFIG.description}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a
              href="#apps"
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-teal-500/25 transition-all"
            >
              Explore Free PWA Tools
            </a>
            <a
              href="/blog"
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold border border-slate-700 transition-all"
            >
              Read Health Articles
            </a>
          </div>
        </div>
      </section>

      {/* PWA Tools Showcase */}
      <section id="apps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Featured PWA Health Tools</h2>
          <p className="text-slate-600">Access mobile-ready tracking apps without downloading from app stores</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PWA_APPS.map((app) => (
            <div
              key={app.id}
              className="glass-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="text-4xl">{app.icon}</div>
                <h3 className="text-xl font-bold text-slate-900">{app.name}</h3>
                <p className="text-sm font-semibold text-teal-700">{app.tagline}</p>
                <p className="text-sm text-slate-600">{app.description}</p>
              </div>
              <div className="pt-6">
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                >
                  Launch App &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
