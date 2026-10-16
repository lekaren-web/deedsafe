'use client';
import { useState } from 'react';
import { sha256Hex } from '../lib/hash';

export default function FileHasher({
  onHashGenerated,
  title = 'Drop a document here, or browse',
  hint = 'Any file type. It stays on this device.',
  compact = false,
}) {
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const hashFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      // The file is read into memory and hashed locally. It is never uploaded.
      const hashHex = await sha256Hex(await file.arrayBuffer());
      onHashGenerated(hashHex, file.name, file.size);
    } catch (err) {
      console.error('Local hashing failed:', err);
      setError("Couldn't read that file. Try another copy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        hashFile(e.dataTransfer.files[0]);
      }}
      className={`relative rounded-md border border-dashed transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-seal ${
        compact ? 'px-4 py-3' : 'px-6 py-8'
      } ${dragging ? 'border-seal bg-seal-soft' : 'border-rule bg-paper hover:border-seal'}`}
    >
      <input
        type="file"
        aria-label={title}
        onChange={(e) => {
          hashFile(e.target.files[0]);
          e.target.value = '';
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <div className={`flex items-center gap-3 ${compact ? '' : 'flex-col text-center'}`}>
        <svg
          className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} shrink-0 text-seal`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" strokeLinejoin="round" />
          <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{loading ? 'Fingerprinting on this device…' : title}</p>
          <p className="mt-0.5 text-xs text-muted">{hint}</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
    </div>
  );
}
