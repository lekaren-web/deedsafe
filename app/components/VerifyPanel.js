'use client';
import { useCallback, useEffect, useState } from 'react';
import FileHasher from './FileHasher';
import { formatTime, shortHash } from '../lib/format';

export default function VerifyPanel({ request }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ status: 'idle' });

  const search = useCallback(async (raw, source = {}) => {
    const q = raw.trim();
    if (!q) return;
    setQuery(q);
    setResult({ status: 'loading', ...source });
    try {
      const res = await fetch(`/api/ledger?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed.');
      setResult({ status: 'done', ...source, ...data });
      const url = new URL(window.location.href);
      url.searchParams.set('q', q);
      window.history.replaceState(null, '', url);
    } catch (err) {
      setResult({ status: 'error', error: err.message, ...source });
    }
  }, []);

  useEffect(() => {
    if (request?.q) search(request.q, request.source);
  }, [request, search]);

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
        }}
        className="flex flex-col gap-2 sm:flex-row"
        role="search"
      >
        <label htmlFor="ledger-query" className="sr-only">
          Fingerprint or transaction ID
        </label>
        <input
          id="ledger-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste a fingerprint or transaction ID"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border border-rule bg-sheet px-3 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-muted focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/25"
        />
        <button
          type="submit"
          disabled={result.status === 'loading'}
          className="rounded-md bg-seal px-4 py-2.5 text-sm font-medium text-on-seal hover:bg-seal-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal disabled:opacity-60"
        >
          {result.status === 'loading' ? 'Searching…' : 'Search ledger'}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-rule" />
        or check a file
        <span className="h-px flex-1 bg-rule" />
      </div>

      <FileHasher
        compact
        title="Drop the document to check"
        hint="We fingerprint it here and look for a matching record."
        onHashGenerated={(hash, fileName) => search(hash, { fileName })}
      />

      <div aria-live="polite">
        <Result result={result} />
      </div>
    </div>
  );
}

function Result({ result }) {
  if (result.status === 'idle') {
    return (
      <p className="text-sm text-muted">
        Fingerprints are 64 characters long. Transaction IDs appear on every DeedSafe receipt.
      </p>
    );
  }
  if (result.status === 'loading') return <p className="text-sm text-muted">Reading the public ledger…</p>;
  if (result.status === 'error') {
    return <p className="rounded-md bg-bad-soft px-4 py-3 text-sm text-bad">{result.error}</p>;
  }

  const [first] = result.entries;
  if (!first) return <NoRecord result={result} />;

  return (
    <div className="rounded-md border-l-4 border-good bg-good-soft px-4 py-4">
      <p className="font-medium text-good">Record found</p>
      <p className="mt-1 text-sm text-ink">
        {result.fileName ? <>“{result.fileName}” matches</> : 'This matches'} a record made{' '}
        <strong className="font-medium">{formatTime(first.blockTime)}</strong>. The file existed by then and hasn&apos;t
        changed since.
      </p>
      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
        <dt className="text-muted">Fingerprint</dt>
        <dd className="truncate font-mono text-ink" title={first.hash}>
          {shortHash(first.hash, 16, 8)}
        </dd>
        {first.journalHash && (
          <>
            <dt className="text-muted">Journal entry</dt>
            <dd className="text-ink">Recorded with a notary journal entry (details private)</dd>
          </>
        )}
        <dt className="text-muted">Slot</dt>
        <dd className="font-mono tabular-nums text-ink">{first.slot.toLocaleString()}</dd>
        <dt className="text-muted">Transaction</dt>
        <dd className="min-w-0">
          <a href={first.explorerUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-seal underline underline-offset-2">
            {shortHash(first.signature, 12, 6)} ↗
          </a>
        </dd>
      </dl>
      {result.entries.length > 1 && (
        <p className="mt-2 text-xs text-muted">Recorded {result.entries.length} times. Showing the earliest.</p>
      )}
      <p className="mt-3 border-t border-good/20 pt-2 text-xs text-muted">
        A match proves what the file contained and when. It doesn&apos;t confirm who signed it.
      </p>
    </div>
  );
}

function NoRecord({ result }) {
  const copy =
    result.mode === 'signature'
      ? {
          title: "That transaction isn't a DeedSafe record",
          body: `It may be on a different network or from another wallet. DeedSafe records here are on Solana ${result.network}.`,
        }
      : result.fileName
        ? {
            title: 'No record of this exact file',
            body: 'Printing, scanning, or re-saving a document changes its fingerprint. Ask the sender for the original digital file.',
          }
        : {
            title: 'No record of this fingerprint',
            body: `Searched the ${result.scanned} most recent DeedSafe records. Check that you copied all 64 characters.`,
          };

  return (
    <div className="rounded-md border-l-4 border-warn bg-warn-soft px-4 py-4">
      <p className="font-medium text-warn">{copy.title}</p>
      <p className="mt-1 text-sm text-ink">{copy.body}</p>
    </div>
  );
}
