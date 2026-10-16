'use client';
import { useCallback, useEffect, useState } from 'react';
import { formatTime, shortHash } from '../lib/format';

export default function LedgerTable({ version, onCheck }) {
  const [state, setState] = useState({ status: 'loading', entries: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const res = await fetch('/api/ledger');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load the ledger.');
      setState({ status: 'done', ...data });
    } catch (err) {
      setState((s) => ({ ...s, status: 'error', error: err.message }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, version]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[60ch]">
          <h2 className="font-serif text-2xl font-semibold text-ink">Public ledger</h2>
          <p className="mt-1 text-sm text-muted">
            The latest DeedSafe records, read directly from Solana{state.network ? ` ${state.network}` : ''}. Nothing here
            comes from our own database, so anyone can confirm it independently.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {state.walletUrl && (
            <a href={state.walletUrl} target="_blank" rel="noopener noreferrer" className="text-seal underline underline-offset-2">
              Recording wallet ↗
            </a>
          )}
          <button
            type="button"
            onClick={load}
            disabled={state.status === 'loading'}
            className="rounded-md border border-rule bg-sheet px-3 py-1.5 text-ink hover:border-seal disabled:opacity-60"
          >
            {state.status === 'loading' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="relative mt-5 overflow-x-auto rounded-md border border-rule bg-sheet">
        <table className="w-full text-sm sm:min-w-[600px]">
          <thead>
            <tr className="border-b border-rule bg-paper text-left text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-2.5 font-medium">Recorded</th>
              <th className="px-4 py-2.5 font-medium">Fingerprint</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Slot</th>
              <th className="px-4 py-2.5 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.entries.map((entry) => (
              <tr key={entry.signature} className="border-b border-rule last:border-b-0">
                <td className="px-4 py-3 text-ink sm:whitespace-nowrap">{formatTime(entry.blockTime)}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-ink" title={entry.hash}>
                  <span className="sm:hidden">{shortHash(entry.hash, 6, 4)}</span>
                  <span className="hidden sm:inline">{shortHash(entry.hash, 14, 6)}</span>
                </td>
                <td className="hidden px-4 py-3 font-mono text-[13px] tabular-nums text-muted sm:table-cell">{entry.slot.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button type="button" onClick={() => onCheck(entry.hash)} className="text-seal underline underline-offset-2">
                    Check
                  </button>
                  <a
                    href={entry.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-muted underline underline-offset-2 hover:text-ink sm:ml-4"
                  >
                    <span className="sm:hidden">↗</span>
                    <span className="hidden sm:inline">Explorer ↗</span>
                  </a>
                </td>
              </tr>
            ))}
            {state.status !== 'loading' && state.entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  {state.status === 'error'
                    ? state.error
                    : 'No records yet. Record a document above and it will appear here.'}
                </td>
              </tr>
            )}
            {state.status === 'loading' && state.entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Reading the ledger…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
