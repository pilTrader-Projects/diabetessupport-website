'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2>Something went wrong!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={() => reset()}
        style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
