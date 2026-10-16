'use client';
import { useEffect, useState } from 'react';
import { sha256Hex } from '../lib/hash';

const SAMPLE = 'Grantor Jane Doe conveys 123 Main St, Parcel 0042-117, to Grantee John Roe for $400,000.';

export default function HashDemo() {
  const [text, setText] = useState(SAMPLE);
  const [hash, setHash] = useState('');
  const [baseline, setBaseline] = useState('');

  useEffect(() => {
    sha256Hex(SAMPLE).then(setBaseline);
  }, []);

  useEffect(() => {
    let cancelled = false;
    sha256Hex(text).then((h) => !cancelled && setHash(h));
    return () => {
      cancelled = true;
    };
  }, [text]);

  const matches = hash && hash === baseline;
  const changed = hash && baseline ? [...hash].filter((c, i) => c !== baseline[i]).length : 0;

  return (
    <div className="rounded-md border border-rule bg-sheet p-5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="demo-text" className="text-sm font-medium text-ink">
          Try it: change the sale price
        </label>
        <button type="button" onClick={() => setText(SAMPLE)} className="text-sm text-seal underline underline-offset-2">
          Reset
        </button>
      </div>
      <textarea
        id="demo-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mt-3 w-full resize-none rounded-md border border-rule bg-paper p-3 font-mono text-[13px] leading-relaxed text-ink focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/25"
      />
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Fingerprint</p>
      <p className="mt-1 break-all font-mono text-[13px] leading-relaxed">
        {[...hash].map((c, i) => (
          <span key={i} className={baseline && c !== baseline[i] ? 'text-warn' : 'text-ink'}>
            {c}
          </span>
        ))}
      </p>
      <p className={`mt-3 text-sm font-medium ${matches ? 'text-good' : 'text-warn'}`}>
        {matches ? 'Matches the recorded original.' : `Doesn't match: ${changed} of 64 characters changed.`}
      </p>
    </div>
  );
}
