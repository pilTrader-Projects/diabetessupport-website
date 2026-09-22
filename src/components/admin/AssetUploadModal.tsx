'use client';

import React, { useState, useRef } from 'react';

interface AssetUploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

/**
 * Modal dialog for uploading a digital asset directly into MongoDB GridFS.
 *
 * @usecase Uploads PDFs, guides, and cheatsheets without third-party cloud bucket requirements.
 */
export default function AssetUploadModal({
  onClose,
  onUploaded,
}: AssetUploadModalProps): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/admin/assets', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file.');
      }

      onUploaded();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">Upload Digital Asset</h3>
            <p className="text-xs text-slate-400 mt-1">
              File will be securely stored in MongoDB GridFS.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.zip,.png,.jpg,.jpeg"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-teal-500 bg-slate-950 p-6 rounded-2xl text-center cursor-pointer transition-colors space-y-2"
          >
            <span className="text-3xl block">📄</span>
            {file ? (
              <div>
                <p className="text-sm font-bold text-white truncate max-w-xs mx-auto">
                  {file.name}
                </p>
                <p className="text-xs text-teal-400 mt-1">{formatSize(file.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-300">
                  Click to choose a file or drag here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF, ZIP, PNG, or JPG (Up to 25MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
