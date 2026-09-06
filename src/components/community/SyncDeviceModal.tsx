'use client';

import React, { useState, useEffect } from 'react';

interface SyncDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 6-Digit Zero-Password Cross-Device Sync Modal Component.
 *
 * @usecase Enables users to link their mobile session to a desktop browser (or vice-versa) using temporary 6-digit PIN codes.
 * @dependencies React useState/useEffect.
 * @param {SyncDeviceModalProps} props Modal visibility state and close callback.
 * @returns {JSX.Element | null} Rendered sync modal interface.
 */
export default function SyncDeviceModal({
  isOpen,
  onClose,
}: SyncDeviceModalProps) {
  const [tab, setTab] = useState<'generate' | 'enter'>('generate');
  const [generatedCode, setGeneratedCode] = useState('');
  const [expiresMinutes, setExpiresMinutes] = useState(15);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && tab === 'generate' && !generatedCode) {
      handleGenerateCode();
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      let authorId = 'usr_guest';
      let authorAlias = 'Community Member';
      let authorTag = '#1001';

      if (typeof window !== 'undefined') {
        authorId = localStorage.getItem('dc_author_id') || `usr_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('dc_author_id', authorId);
        authorAlias = localStorage.getItem('dc_author_alias') || 'Community Member';
        authorTag = localStorage.getItem('dc_author_tag') || '#1001';
      }

      const res = await fetch('/api/v1/community/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId, authorAlias, authorTag }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setGeneratedCode(json.data.code);
        setExpiresMinutes(json.data.expiresMinutes || 15);
      } else {
        setStatusMsg({ type: 'error', text: json.message || 'Failed to generate code' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error connecting to sync service' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/v1/community/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('dc_author_id', json.data.authorId);
          localStorage.setItem('dc_author_alias', json.data.authorAlias);
          localStorage.setItem('dc_author_tag', json.data.authorTag);
        }
        setStatusMsg({ type: 'success', text: `Linked as ${json.data.authorAlias} ${json.data.authorTag}!` });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: json.message || 'Invalid or expired code' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Connection error while claiming code' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Sync Devices</h3>
            <p className="text-xs text-slate-500">Link your phone & PC without any passwords</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('generate')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'generate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Share This Device
          </button>
          <button
            type="button"
            onClick={() => setTab('enter')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'enter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Enter Code from Phone
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold ${
              statusMsg.type === 'success'
                ? 'bg-teal-50 border border-teal-200 text-teal-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {tab === 'generate' ? (
          <div className="text-center space-y-4 py-2">
            <p className="text-xs text-slate-600">
              Open <strong>DiabetesCare PH</strong> on your second device, click <em>Sync Device</em>, and enter this 6-digit code:
            </p>
            <div className="py-4 bg-slate-50 border border-dashed border-teal-400 rounded-2xl">
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-teal-700">
                {isLoading ? '••••••' : generatedCode || '------'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              ⏱️ Valid for {expiresMinutes} minutes • Single-use secure transfer
            </p>
          </div>
        ) : (
          <form onSubmit={handleClaimCode} className="space-y-4 py-2">
            <div className="space-y-1 text-center">
              <label className="text-xs font-bold text-slate-700 block">
                Enter the 6-digit code displayed on your other device:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center font-mono text-2xl tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || inputCode.length !== 6}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? 'Verifying Code...' : 'Link Device Now'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
