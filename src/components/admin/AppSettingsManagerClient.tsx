'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppConfigData } from '@/services/appConfigService';

interface AppSettingsManagerClientProps {
  initialConfig: AppConfigData;
}

/**
 * Interactive Client Component for managing dynamic Companion App integration, URLs, and rebranding.
 *
 * @usecase Enables administrators to configure app destination (Web PWA, PlayStore, AppStore),
 * CTA copy, and immediate access behavior without code changes or redeploying the advocacy site.
 */
export default function AppSettingsManagerClient({
  initialConfig,
}: AppSettingsManagerClientProps): React.JSX.Element {
  const [config, setConfig] = useState<AppConfigData>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (
    field: keyof AppConfigData,
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveStatus('idle');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      const res = await fetch('/api/v1/admin/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update companion app configuration.');
      }

      setSaveStatus('success');
      setStatusMessage('Configuration saved successfully! All subscriber forms now use these settings.');
      if (data.data) {
        setConfig(data.data);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(err.message || 'Network error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl">📱</span>
          <div>
            <h2 className="text-base font-bold text-white">Cross-Project Dynamic Destination Management</h2>
            <p className="text-xs text-slate-300">
              Changes saved here immediately direct new subscribers to the updated app link without rebuilding or redeploying the website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {config.appUrl && (
            <a
              href={config.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Test Current Link</span>
              <span className="text-xs">↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Grid: Form Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white">App Integration Settings</h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure how the companion app is identified and where subscribers are directed immediately upon signing up.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* App Brand Name */}
            <div>
              <label htmlFor="app-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Companion App Brand Name <span className="text-amber-400">*</span>
              </label>
              <input
                id="app-name"
                type="text"
                required
                value={config.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                placeholder="e.g. GlycoSense, MetricPace, HearthTally"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used in promotional card copy, button labels, and welcome notifications.
              </p>
            </div>

            {/* Destination URL */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="app-url" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Destination App URL <span className="text-amber-400">*</span>
                </label>
                {config.appUrl && (
                  <a
                    href={config.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-teal-400 hover:text-teal-300 underline font-semibold"
                  >
                    Open URL in new tab ↗
                  </a>
                )}
              </div>
              <input
                id="app-url"
                type="url"
                required
                value={config.appUrl}
                onChange={(e) => handleChange('appUrl', e.target.value)}
                placeholder="https://glycosense.vercel.app or https://play.google.com/store/apps/details?id=..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Direct destination link for web PWA, Play Store listing, Apple App Store, or web portal.
              </p>
            </div>

            {/* Platform Type */}
            <div>
              <label htmlFor="platform-type" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Platform Architecture
              </label>
              <select
                id="platform-type"
                value={config.platformType}
                onChange={(e) => handleChange('platformType', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="web">🌐 Progressive Web App (PWA) / Hosted Web App</option>
                <option value="playstore">🤖 Google Play Store (Android App)</option>
                <option value="appstore">🍎 Apple App Store (iOS App)</option>
                <option value="custom">⚡ Custom Cloud Web Service / Portal</option>
              </select>
            </div>

            {/* Action Button Label */}
            <div>
              <label htmlFor="cta-text" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Instant Action Button Label
              </label>
              <input
                id="cta-text"
                type="text"
                value={config.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                placeholder="e.g. Launch GlycoSense App Now, Download on Google Play"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Text on the primary button displayed to subscribers right after submitting the form.
              </p>
            </div>

            {/* Success Headline */}
            <div>
              <label htmlFor="success-title" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Instant Access Headline
              </label>
              <input
                id="success-title"
                type="text"
                value={config.successTitle}
                onChange={(e) => handleChange('successTitle', e.target.value)}
                placeholder="e.g. Free Account Access Ready!"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Success / Instruction Message */}
            <div>
              <label htmlFor="success-message" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Instruction Message
              </label>
              <textarea
                id="success-message"
                rows={2}
                value={config.successMessage}
                onChange={(e) => handleChange('successMessage', e.target.value)}
                placeholder="e.g. Free account access ready! Click below to launch your account immediately."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Checkbox: Open in New Tab */}
            <div className="flex items-center gap-3 pt-1">
              <input
                id="open-in-new-tab"
                type="checkbox"
                checked={config.openInNewTab}
                onChange={(e) => handleChange('openInNewTab', e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-700 focus:ring-teal-400"
              />
              <label htmlFor="open-in-new-tab" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Open destination link in a new browser tab (<code className="text-teal-400">target=&quot;_blank&quot;</code>)
              </label>
            </div>

            {/* Status Feedback */}
            {saveStatus === 'success' && (
              <div role="alert" className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-semibold">
                ✓ {statusMessage}
              </div>
            )}

            {saveStatus === 'error' && (
              <div role="alert" className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 font-semibold">
                ⚠️ {statusMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Saving Configuration...</span>
                ) : (
                  <>
                    <span>💾 Save Companion App Settings</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Subscriber Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Subscriber Preview
            </span>
            <span className="text-[11px] text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 font-semibold">
              Real-Time Simulated View
            </span>
          </div>

          {/* Simulated Card Container */}
          <div className="text-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 p-6 sm:p-8 space-y-5 text-center">
            <div className="space-y-1">
              <span className="inline-block bg-amber-400/25 text-amber-200 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border border-amber-300/40">
                🎁 Instant Access Card
              </span>
              <p className="text-xs text-purple-100 max-w-xs mx-auto pt-1">
                Enter your details below to get FREE ACCESS to the <strong className="text-amber-200">{config.appName}</strong> App...
              </p>
            </div>

            {/* Instant Access Ready Box */}
            <div className="p-5 bg-white/20 backdrop-blur-md rounded-2xl text-center space-y-3.5 border border-white/30 shadow-inner">
              <span className="text-3xl block">🎉</span>
              <div className="space-y-1">
                <h5 className="text-lg font-black text-white">{config.successTitle || 'Free Account Access Ready!'}</h5>
                <p className="text-xs text-purple-100 leading-relaxed">
                  {config.successMessage || 'Free account access ready! Click below to launch your account immediately.'}
                </p>
              </div>

              {/* Simulated Button */}
              <a
                href={config.appUrl || '#'}
                target={config.openInNewTab ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!config.appUrl) e.preventDefault();
                }}
                className="w-full py-3 px-5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 border border-amber-200 hover:scale-[1.02] transition-transform"
              >
                <span>{config.ctaText || `Launch ${config.appName} App Now`}</span>
                <span className="text-base">➔</span>
              </a>

              <p className="text-[10px] text-purple-200/90 leading-tight">
                ⚡ Instant access active — click above to open your account now. No waiting for email.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200">
              <span>Platform: <strong className="text-white uppercase">{config.platformType}</strong></span>
              <span>Target: <strong className="text-white">{config.openInNewTab ? '_blank' : '_self'}</strong></span>
            </div>
          </div>

          {/* Contextual Architecture Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Decoupled Ecosystem Guarantee</span>
            </h4>
            <p className="leading-relaxed">
              The companion app codebase is maintained independently. If the app transitions to native mobile store listings (Google Play Store, Apple App Store) or rebrands in the future (e.g., <code className="text-teal-400">MetricPace</code>), updates made here will instantly route all existing and new leads without requiring website code edits or server restarts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
