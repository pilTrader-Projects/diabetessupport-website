'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface SyncDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * QR Code & 6-Digit Zero-Password Cross-Device Sync Modal Component.
 *
 * @usecase Enables users to link their mobile session to desktop (or vice-versa) via QR code scan (default) or manual 6-digit PIN.
 * @dependencies React useState/useEffect, QRCode generator.
 * @param {SyncDeviceModalProps} props Modal visibility state and close callback.
 * @returns {JSX.Element | null} Rendered sync modal interface.
 */
export default function SyncDeviceModal({
  isOpen,
  onClose,
}: SyncDeviceModalProps) {
  const [tab, setTab] = useState<'generate' | 'enter'>('generate');
  const [generateMode, setGenerateMode] = useState<'qr' | 'manual'>('qr');
  const [generatedCode, setGeneratedCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [expiresMinutes, setExpiresMinutes] = useState(15);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && tab === 'generate' && !generatedCode) {
      handleGenerateCode();
    }
  }, [isOpen, tab]);

  // Generate QR Code data URL whenever code changes
  useEffect(() => {
    if (generatedCode) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const syncUrl = `${origin}/sync?code=${generatedCode}`;

      QRCode.toDataURL(syncUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [generatedCode]);

  // Live Auto-Polling: Detect when the mobile device has claimed the code
  useEffect(() => {
    if (!isOpen || tab !== 'generate' || !generatedCode) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/community/sync?code=${generatedCode}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.claimed) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setStatusMsg({
              type: 'success',
              text: `🎉 Successfully linked with ${json.data.authorAlias} ${json.data.authorTag}!`,
            });
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 1600);
          }
        }
      } catch {
        // Silently ignore transient network poll errors
      }
    }, 2500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, tab, generatedCode, onClose]);

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

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        {/* Header */}
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

        {/* Primary Tab Toggle */}
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
          <div className="space-y-4 py-1">
            {/* Sub-toggle: Scan QR (Default) vs Manual Code */}
            <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl max-w-xs mx-auto text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setGenerateMode('qr')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                  generateMode === 'qr'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>📷</span>
                <span>Scan QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setGenerateMode('manual')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                  generateMode === 'manual'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🔢</span>
                <span>6-Digit Code</span>
              </button>
            </div>

            {generateMode === 'qr' ? (
              /* QR Code Mode (Default Option) */
              <div className="text-center space-y-3">
                <p className="text-xs text-slate-600">
                  Point your phone&apos;s camera at this QR code to instantly sync:
                </p>

                <div className="relative inline-block p-3 bg-white border-2 border-dashed border-teal-400 rounded-2xl shadow-xs">
                  {isLoading || !qrCodeDataUrl ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrCodeDataUrl}
                      alt="Device Sync QR Code"
                      width={200}
                      height={200}
                      className="rounded-xl mx-auto"
                    />
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2 text-[11px] text-teal-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  <span>Waiting for mobile scan...</span>
                </div>

                <button
                  type="button"
                  onClick={() => setGenerateMode('manual')}
                  className="text-xs font-bold text-slate-500 hover:text-teal-700 underline underline-offset-2 cursor-pointer pt-1"
                >
                  Prefer typing? View 6-digit code instead &rarr;
                </button>
              </div>
            ) : (
              /* Manual 6-Digit Code Mode (Retained Option) */
              <div className="text-center space-y-4 py-2">
                <p className="text-xs text-slate-600">
                  Open <strong>DiabetesCare PH</strong> on your second device, click <em>Sync Device</em>, and enter this 6-digit code:
                </p>

                <div className="py-4 bg-slate-50 border border-dashed border-teal-400 rounded-2xl relative">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-teal-700">
                    {isLoading ? '••••••' : generatedCode || '------'}
                  </span>
                  {generatedCode && (
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                    >
                      {isCopied ? 'Copied! ✓' : 'Copy'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setGenerateMode('qr')}
                  className="text-xs font-bold text-slate-500 hover:text-teal-700 underline underline-offset-2 cursor-pointer"
                >
                  &larr; Switch back to QR Code
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-400 font-semibold text-center border-t border-slate-100 pt-3">
              ⏱️ Valid for {expiresMinutes} minutes • Single-use secure transfer
            </p>
          </div>
        ) : (
          /* Enter Code from Phone */
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
