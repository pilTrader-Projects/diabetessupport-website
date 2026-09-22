'use client';

import React from 'react';

export interface CampaignFormData {
  referenceCode: string;
  name: string;
  brevoList: string;
  defaultMetabolicStage: string;
  description: string;
  isActive: boolean;
}

interface CampaignModalProps {
  isOpen: boolean;
  editingCode: string | null;
  formData: CampaignFormData;
  submitting: boolean;
  onClose: () => void;
  onChange: (data: CampaignFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal form component for creating or editing a Brevo Campaign Configuration.
 *
 * @usecase Captures campaign referenceCode, Brevo list name/ID, and metabolic stage.
 * @param {CampaignModalProps} props Component props.
 * @returns {JSX.Element | null} Rendered modal dialog.
 */
export default function CampaignModal({
  isOpen,
  editingCode,
  formData,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: CampaignModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">
            {editingCode ? `Edit: ${editingCode}` : 'Create New Campaign Mapping'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Reference Code (Slug)
            </label>
            <input
              type="text"
              required
              disabled={Boolean(editingCode)}
              placeholder="e.g. companion_app_users"
              value={formData.referenceCode}
              onChange={(e) => onChange({ ...formData, referenceCode: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Campaign Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GlycoSense Companion App Claim"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Target Brevo List Name or Numeric ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. companion_app_users or 42"
              value={formData.brevoList}
              onChange={(e) => onChange({ ...formData, brevoList: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Default Metabolic Stage
            </label>
            <input
              type="text"
              required
              placeholder="e.g. COMPANION_APP_USER, GENERAL_AWARENESS"
              value={formData.defaultMetabolicStage}
              onChange={(e) =>
                onChange({ ...formData, defaultMetabolicStage: e.target.value })
              }
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Brief note on target audience or channel"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeToggle"
              checked={formData.isActive}
              onChange={(e) => onChange({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 bg-slate-950 border-slate-700"
            />
            <label htmlFor="activeToggle" className="text-slate-300 font-medium">
              Active (Receiving Leads)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
