'use client';

import React from 'react';

export interface SymptomItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const METABOLIC_SYMPTOMS: SymptomItem[] = [
  {
    id: 'belly-anchor',
    title: 'The Belly Anchor',
    description: 'Weight accumulation exclusively around your waistline that refuses to budge.',
    icon: '⚖️',
  },
  {
    id: '3pm-crash',
    title: 'The 3 PM Crash',
    description: 'Intense brain fog and a desperate need for a nap or caffeine 30 minutes after lunch.',
    icon: '☕',
  },
  {
    id: 'skin-alarms',
    title: 'The Skin Alarms',
    description: 'Small, flesh-colored skin tags on your neck or dark, velvety patches of skin.',
    icon: '🔍',
  },
  {
    id: '3am-wakeup',
    title: 'The 3 AM Wake-up',
    description: 'Consistently waking up in the middle of the night just to use the restroom.',
    icon: '🌙',
  },
];

interface SymptomChecklistProps {
  selectedSymptoms: string[];
  onToggleSymptom: (title: string) => void;
}

/**
 * Interactive Self-Check Symptom Checklist Component.
 *
 * @usecase Lets users self-identify early warning signs of chronic hyperinsulinemia based on Dr. Benjamin Bikman's metabolic research.
 * @param {SymptomChecklistProps} props Selected items and toggle callback.
 * @returns {JSX.Element} Interactive checklist cards with dynamic metabolic risk feedback.
 */
export default function SymptomChecklist({
  selectedSymptoms,
  onToggleSymptom,
}: SymptomChecklistProps): React.JSX.Element {
  const count = selectedSymptoms.length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="inline-block bg-purple-900/60 text-purple-200 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-purple-500/40">
          🩺 Interactive Metabolic Self-Check
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Are You Experiencing Any of These 4 Silent Alarms?
        </h2>
        <p className="text-sm text-purple-200/90 leading-relaxed">
          Check each symptom that sounds familiar. These are the physical red flags your body uses to signal high insulin levels.
        </p>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {METABOLIC_SYMPTOMS.map((item) => {
          const isChecked = selectedSymptoms.includes(item.title);
          return (
            <label
              key={item.id}
              htmlFor={`chk-${item.id}`}
              className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'bg-purple-950/80 border-pink-500/80 shadow-lg shadow-pink-950/40 ring-1 ring-pink-500'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500/80 hover:bg-slate-850'
              }`}
            >
              <input
                id={`chk-${item.id}`}
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleSymptom(item.title)}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-base font-bold text-white tracking-tight">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Dynamic Metabolic Risk Feedback */}
      <div className="p-4 sm:p-5 rounded-2xl border transition-all duration-300">
        {count === 0 && (
          <div className="text-center text-xs sm:text-sm text-purple-300/80 italic">
            👆 Tap any symptom above that you have noticed recently to calculate your metabolic stress level.
          </div>
        )}

        {count >= 1 && count <= 2 && (
          <div className="space-y-1 bg-amber-500/10 border border-amber-500/40 p-4 rounded-xl text-amber-200 animate-fadeIn">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
              <span>⚠️</span>
              <span>Moderate Hyperinsulinemia Probability ({count}/4 Symptoms Checked)</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              Dr. Bikman’s research shows that even 1 or 2 of these symptoms indicates your pancreas is working double overtime. Your blood glucose appears &ldquo;normal&rdquo; solely because your body is pumping excessive insulin behind the scenes.
            </p>
          </div>
        )}

        {count >= 3 && (
          <div className="space-y-1 bg-rose-500/15 border border-rose-500/50 p-4 rounded-xl text-rose-200 animate-fadeIn">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
              <span>🚨</span>
              <span>High Metabolic Alarm ({count}/4 Symptoms Checked)</span>
            </div>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              You are likely suffering from chronic hyperinsulinemia. Your body has been forced into an aggressive fat-storage mode. Tracking glucose alone is missing the root cause. You need the 4 Golden Rules to drop insulin before permanent pancreatic burnout occurs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
