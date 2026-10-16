'use client';
import { useState } from 'react';

export default function EntryCheck({ id, txId }) {
  const [state, setState] = useState({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  const check = async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(`/api/journal/${id}/verify`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check failed.');
      setState({ status: 'done', ...data });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?q=${txId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const ok = state.status === 'done' && state.storedMatches && state.onLedger && state.documentMatches && state.journalMatches;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <button
        type="button"
        onClick={check}
        disabled={state.status === 'loading'}
        className="rounded-md border border-rule bg-sheet px-3 py-1.5 font-medium text-ink hover:border-seal disabled:opacity-60"
      >
        {state.status === 'loading' ? 'Checking…' : 'Check against ledger'}
      </button>
      <button type="button" onClick={copyLink} className="text-seal underline underline-offset-2">
        {copied ? 'Link copied' : 'Copy verification link'}
      </button>
      <span aria-live="polite" className="basis-full sm:basis-auto">
        {state.status === 'error' && <span className="text-bad">{state.error}</span>}
        {state.status === 'done' &&
          (ok ? (
            <span className="text-good">This entry matches its ledger record. Nothing has changed since it was recorded.</span>
          ) : (
            <span className="text-bad">
              {!state.onLedger
                ? "The ledger transaction couldn't be found."
                : 'This entry no longer matches its ledger record. Contact support before relying on it.'}
            </span>
          ))}
      </span>
    </div>
  );
}
