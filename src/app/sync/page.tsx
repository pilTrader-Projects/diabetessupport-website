'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SyncContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeParam = searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState(codeParam);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [claimedAuthor, setClaimedAuthor] = useState<{ alias: string; tag: string } | null>(null);

  useEffect(() => {
    if (codeParam && codeParam.trim().length === 6) {
      handleClaimCode(codeParam.trim());
    }
  }, [codeParam]);

  const handleClaimCode = async (codeToClaim: string) => {
    setStatus('loading');
    setMessage('Linking your device...');

    try {
      const res = await fetch('/api/v1/community/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToClaim.replace(/\D/g, '') }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('dc_author_id', json.data.authorId);
          localStorage.setItem('dc_author_alias', json.data.authorAlias);
          localStorage.setItem('dc_author_tag', json.data.authorTag);
        }
        setClaimedAuthor({ alias: json.data.authorAlias, tag: json.data.authorTag });
        setStatus('success');
        setMessage(`Successfully linked as ${json.data.authorAlias} ${json.data.authorTag}!`);

        setTimeout(() => {
          router.push('/community');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(json.message || 'Invalid or expired sync code. Please generate a new code.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error while linking device. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length === 6) {
      handleClaimCode(inputCode.trim());
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-6">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm">
            📲
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Device Synchronization
          </h1>
          <p className="text-xs text-slate-500">
            DiabetesCare PH Zero-Password Identity Transfer
          </p>
        </div>

        {/* Dynamic States */}
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">{message}</p>
            <p className="text-xs text-slate-400">Please keep this browser window open...</p>
          </div>
        )}

        {status === 'success' && claimedAuthor && (
          <div className="py-6 space-y-4 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">
                You&apos;re Connected!
              </h2>
              <p className="text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200 py-2 px-3 rounded-xl inline-block">
                {claimedAuthor.alias} {claimedAuthor.tag}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Your community session is now active on this device. Redirecting to the forum...
            </p>
            <Link
              href="/community"
              className="inline-block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Go to Community Forum Now &rarr;
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold leading-relaxed">
              <p className="font-bold text-red-900 mb-1">⚠️ Connection Failed</p>
              {message}
            </div>

            <div className="pt-2 space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Try entering your 6-digit sync code manually:
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center font-mono text-2xl tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={inputCode.length !== 6}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  Verify Code
                </button>
              </form>

              <Link
                href="/community"
                className="block text-xs font-bold text-slate-500 hover:text-slate-800 pt-2"
              >
                &larr; Back to Community
              </Link>
            </div>
          </div>
        )}

        {status === 'idle' && !codeParam && (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <p className="text-xs text-slate-600">
              Enter the 6-digit code displayed on your primary device:
            </p>
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center font-mono text-2xl tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={inputCode.length !== 6}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              Link Device Now
            </button>
            <Link
              href="/community"
              className="block text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              &larr; Back to Community
            </Link>
          </form>
        )}

        {/* Security & Privacy Notice */}
        <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-4">
          🔒 Protected under RA 10173 (Philippine Data Privacy Act). Temporary sync codes expire automatically after 15 minutes.
        </p>
      </div>
    </div>
  );
}

export default function SyncPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SyncContent />
    </Suspense>
  );
}
