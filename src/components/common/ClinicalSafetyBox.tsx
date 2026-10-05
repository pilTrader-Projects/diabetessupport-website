import React from 'react';

export interface ClinicalSafetyBoxProps {
  variant?: 'fasting' | 'medication' | 'emergency' | 'general' | 'all';
  className?: string;
}

/**
 * Clinical Safety & Contraindication Notice Component.
 *
 * @usecase Displays standardized, medically hedged safety warnings across educational,
 *          dietary, and fasting guides, specifically flagging hypoglycemia risks for
 *          patients taking glucose-lowering medications, as well as emergency thresholds.
 * @dependencies React.
 */
export default function ClinicalSafetyBox({
  variant = 'fasting',
  className = '',
}: ClinicalSafetyBoxProps) {
  const showFasting = variant === 'fasting' || variant === 'all';
  const showMedication = variant === 'medication' || variant === 'all' || variant === 'fasting';
  const showEmergency = variant === 'emergency' || variant === 'all';
  const showGeneral = variant === 'general' || variant === 'all';

  return (
    <aside
      role="note"
      aria-label="Clinical Safety & Contraindications Notice"
      className={`bg-amber-50/90 border border-amber-300/90 rounded-2xl p-5 md:p-6 text-slate-800 shadow-sm space-y-3.5 my-6 ${className}`}
    >
      <div className="flex items-center space-x-2.5 text-amber-900 border-b border-amber-200/80 pb-2.5">
        <span className="text-xl" aria-hidden="true">
          ⚠️
        </span>
        <h3 className="font-extrabold text-sm sm:text-base tracking-tight uppercase">
          Clinical Safety &amp; Guidance Notice
        </h3>
      </div>

      <div className="text-xs sm:text-sm leading-relaxed space-y-2.5 text-slate-700">
        {showFasting && (
          <p>
            <strong className="text-slate-900">Fasting &amp; Dietary Changes:</strong> Adjusting meal
            timing, intermittent fasting, or significantly restricting carbohydrates can pose acute
            health risks—including <em>severe hypoglycemia</em> (dangerously low blood sugar)—for
            individuals taking insulin, sulfonylureas, or other glucose-lowering medications. It is
            also not recommended without close medical supervision for pregnant or breastfeeding
            individuals, children and teens, older adults, individuals with renal/kidney disease, or
            anyone with a history of eating disorders.
          </p>
        )}

        {showMedication && (
          <p className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-200 text-amber-950 font-medium text-xs">
            💊 <strong>Do Not Adjust Medications Independently:</strong> Never start, stop, or alter
            the dosage of any prescription medication based on educational materials. Any changes
            must be supervised directly by your attending physician.
          </p>
        )}

        {showEmergency && (
          <p className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-950 font-medium text-xs">
            🚨 <strong>When to Seek Urgent Care:</strong> Seek immediate medical attention if you
            experience severe high or low glucose readings, intense unquenchable thirst, rapid
            unexplained weight loss, blurred vision, disorientation, fainting, or chest pain.
          </p>
        )}

        {showGeneral && (
          <p className="text-[11px] sm:text-xs text-slate-500 pt-1">
            * This page is for health education and trajectory awareness only. It cannot diagnose or
            treat any medical condition. Always consult a qualified medical professional for
            personal diagnostic evaluations.
          </p>
        )}
      </div>
    </aside>
  );
}
