'use client';

import React, { useState } from 'react';
import { CampaignResolvedConfig } from '@/services/campaignService';
import CampaignModal, { CampaignFormData } from '@/components/admin/CampaignModal';

interface CampaignsManagerProps {
  initialCampaigns: CampaignResolvedConfig[];
}

/**
 * Client Management Component for dynamic Brevo Campaigns & Lead Capture Mappings.
 *
 * @usecase Allows owner admin to dynamically configure and create campaigns, mapping reference codes to Brevo lists and metabolic stages.
 * @param {CampaignsManagerProps} props Initial server-fetched campaigns list.
 * @returns {JSX.Element} Interactive campaign manager dashboard interface.
 */
export default function CampaignsManagerClient({
  initialCampaigns,
}: CampaignsManagerProps): React.JSX.Element {
  const [campaigns, setCampaigns] = useState<CampaignResolvedConfig[]>(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    referenceCode: '',
    name: '',
    brevoList: '',
    defaultMetabolicStage: 'GENERAL_AWARENESS',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCode(null);
    setFormData({
      referenceCode: '',
      name: '',
      brevoList: '',
      defaultMetabolicStage: 'GENERAL_AWARENESS',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CampaignResolvedConfig) => {
    setEditingCode(item.referenceCode);
    setFormData({
      referenceCode: item.referenceCode,
      name: item.name,
      brevoList: item.brevoList,
      defaultMetabolicStage: item.defaultMetabolicStage,
      description: item.description || '',
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save campaign configuration.');
      }

      setCampaigns((prev) => {
        const cleanCode = formData.referenceCode.trim().toLowerCase();
        const index = prev.findIndex((c) => c.referenceCode === cleanCode);
        const updated: CampaignResolvedConfig = {
          referenceCode: cleanCode,
          name: formData.name.trim(),
          brevoList: formData.brevoList.trim(),
          defaultMetabolicStage: formData.defaultMetabolicStage.trim().toUpperCase(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
        };
        if (index >= 0) {
          const next = [...prev];
          next[index] = updated;
          return next;
        }
        return [updated, ...prev];
      });

      setIsModalOpen(false);
      setMessage('Campaign configuration saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Error saving campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Informational Guidance Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
          <span>💡</span>
          <span>Zero-Code Lead Capture Campaign Decoupling</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Tag any lead capture page, dialog, or button with your custom reference code (e.g.{' '}
          <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300">source=&quot;companion_app_users&quot;</code>). The system automatically enrolls the contact into your mapped Brevo list and assigns their <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300">METABOLIC_STAGE</code> property dynamically.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-teal-900/40 border border-teal-500/40 text-teal-200 text-sm rounded-xl">
          {message}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Active Campaign Configurations ({campaigns.length})</h2>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          + Add New Campaign Mapping
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((item) => (
          <div
            key={item.referenceCode}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md">
                  {item.referenceCode}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    item.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              {item.description && <p className="text-xs text-slate-400">{item.description}</p>}

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Brevo List:</span>
                  <span className="font-mono font-bold text-teal-300">{item.brevoList}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metabolic Stage:</span>
                  <span className="font-mono font-bold text-purple-300">{item.defaultMetabolicStage}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(item)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Configure Settings &rarr;
            </button>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      <CampaignModal
        isOpen={isModalOpen}
        editingCode={editingCode}
        formData={formData}
        submitting={submitting}
        onClose={() => setIsModalOpen(false)}
        onChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
