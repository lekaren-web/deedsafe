'use client';
import Link from 'next/link';
import { useState } from 'react';
import FileHasher from './FileHasher';
import JournalForm from './JournalForm';
import { formatTime, shortHash } from '../lib/format';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SignInPrompt() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink">Sign in to add entries to your private journal.</p>
      <p className="text-sm text-muted">
        Each entry keeps the signer&apos;s details in your journal and records only two fingerprints on the public
        ledger: one for the document and one for the entry.
      </p>
      <Link
        href="/login?next=%2F%3Ftab%3Drecord"
        className="block w-full rounded-md bg-seal px-4 py-3 text-center text-sm font-medium text-on-seal hover:bg-seal-strong"
      >
        Sign in to record
      </Link>
    </div>
  );
}

export default function RecordPanel({ signedIn, onRecorded }) {
  const [file, setFile] = useState(null);
  const [stamp, setStamp] = useState({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  if (!signedIn) return <SignInPrompt />;

  const reset = () => {
    setFile(null);
    setStamp({ status: 'idle' });
  };

  const record = async (journal) => {
    setStamp({ status: 'loading' });
    try {
      const res = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...journal, documentSha256: file.hash }),
      });
      const data = await res.json();
      if (!res.ok) return setStamp({ status: 'error', error: data.error || 'Recording failed.', fields: data.fields });
      setStamp({ status: 'done', ...data });
      onRecorded?.(data);
    } catch {
      setStamp({ status: 'error', error: "Couldn't reach DeedSafe. Check your connection and try again." });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?q=${stamp.txId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Step 1 of 2 · Document</p>
        <FileHasher
          title="Drop the signed document, or browse"
          hint="It's fingerprinted on this device and never uploaded."
          onHashGenerated={(hash, name, size) => setFile({ hash, name, size })}
        />
      </div>
    );
  }

  const fileSummary = (
    <div className="flex items-start justify-between gap-3 rounded-md bg-paper px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{file.name}</p>
        <p className="truncate font-mono text-xs text-muted" title={file.hash}>
          {formatBytes(file.size)} · {shortHash(file.hash, 10, 6)}
        </p>
      </div>
      {stamp.status !== 'done' && (
        <button type="button" onClick={reset} className="shrink-0 text-sm text-seal underline underline-offset-2">
          Change
        </button>
      )}
    </div>
  );

  if (stamp.status === 'done') {
    return (
      <div className="space-y-4">
        {fileSummary}
        <div className="rounded-md border-l-4 border-good bg-good-soft px-4 py-4">
          <p className="font-medium text-good">Saved to your journal and recorded</p>
          <p className="mt-1 text-sm text-ink">{formatTime(stamp.blockTime)} on Solana {stamp.network}</p>
          <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
            <dt className="text-muted">Document</dt>
            <dd className="truncate font-mono text-ink">{shortHash(stamp.documentSha256, 12, 6)}</dd>
            <dt className="text-muted">Journal entry</dt>
            <dd className="truncate font-mono text-ink">{shortHash(stamp.journalSha256, 12, 6)}</dd>
            <dt className="text-muted">Transaction</dt>
            <dd className="truncate font-mono text-ink">{shortHash(stamp.txId, 12, 6)}</dd>
          </dl>
          <p className="mt-3 text-xs text-muted">The signer&apos;s details stayed in your journal. Only these fingerprints are public.</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/journal" className="text-seal underline underline-offset-2">Open journal</Link>
            <button type="button" onClick={copyLink} className="text-seal underline underline-offset-2">
              {copied ? 'Link copied' : 'Copy verification link'}
            </button>
            <a href={stamp.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-seal underline underline-offset-2">
              Explorer ↗
            </a>
          </div>
        </div>
        <button type="button" onClick={reset} className="w-full rounded-md border border-rule px-4 py-2.5 text-sm font-medium text-ink hover:border-seal">
          Record another signing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Step 2 of 2 · Journal entry</p>
      {fileSummary}
      <p className="text-xs text-muted">
        These details stay in your private journal. The public ledger gets only the document&apos;s fingerprint and a
        fingerprint of this entry.
      </p>
      {stamp.status === 'error' && <p className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{stamp.error}</p>}
      <JournalForm submitting={stamp.status === 'loading'} fieldErrors={stamp.fields} onSubmit={record} />
    </div>
  );
}
