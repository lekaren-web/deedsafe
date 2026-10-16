import Link from 'next/link';
import { redirect } from 'next/navigation';
import EntryCheck from './EntryCheck';
import LocalTime from './LocalTime';
import SiteHeader from '../components/SiteHeader';
import { ACT_TYPES, ID_METHODS, labelFor } from '../config/journal';
import { shortHash } from '../lib/format';
import { explorerUrl } from '../lib/solana';
import { createClient } from '../lib/supabase/server';

export const metadata = { title: 'My journal · DeedSafe' };
export const dynamic = 'force-dynamic';

const STATUS = {
  recorded: { label: 'Recorded', className: 'bg-good-soft text-good' },
  pending: { label: 'Pending', className: 'bg-warn-soft text-warn' },
  failed: { label: 'Not recorded', className: 'bg-bad-soft text-bad' },
};

function Detail({ label, children, mono = false }) {
  if (children == null || children === '') return null;
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className={`mt-0.5 break-words text-sm text-ink ${mono ? 'font-mono text-[13px]' : ''}`}>{children}</dd>
    </div>
  );
}

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/journal');

  // Row-level security returns only this notary's entries.
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(200);

  const recordedCount = entries?.filter((e) => e.status === 'recorded').length ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[62ch]">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Private · only you can see this</p>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">My journal</h1>
            <p className="mt-2 text-sm text-muted">
              {entries?.length
                ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}, ${recordedCount} recorded on the public ledger. Entries can't be edited or deleted once saved.`
                : 'Entries you record appear here. They can’t be edited or deleted once saved.'}
            </p>
          </div>
          <Link
            href="/?tab=record"
            className="rounded-md bg-seal px-4 py-2.5 text-sm font-medium text-on-seal hover:bg-seal-strong"
          >
            Record a signing
          </Link>
        </div>

        {error && <p className="mt-8 rounded-md bg-bad-soft px-4 py-3 text-sm text-bad">Couldn&apos;t load your journal. Refresh to try again.</p>}

        {entries?.length === 0 && (
          <div className="mt-8 rounded-md border border-dashed border-rule px-6 py-12 text-center">
            <p className="font-medium text-ink">No entries yet</p>
            <p className="mt-1 text-sm text-muted">Record your first signing and it will appear here with its ledger receipt.</p>
          </div>
        )}

        {entries?.length > 0 && (
          <ol className="mt-8 overflow-hidden rounded-md border border-rule bg-sheet">
            {entries.map((entry) => {
              const status = STATUS[entry.status] ?? STATUS.pending;
              return (
                <li key={entry.id} className="border-b border-rule last:border-b-0">
                  <details className="group">
                    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 px-4 py-4 hover:bg-paper sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:px-5 [&::-webkit-details-marker]:hidden">
                      <span className="text-sm text-ink sm:order-none">
                        <LocalTime iso={entry.performed_at} />
                      </span>
                      <span className={`row-span-2 self-center justify-self-end rounded-full px-2.5 py-0.5 font-mono text-[11px] sm:order-last sm:row-span-1 ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{entry.signer_name}</span>
                        <span className="block truncate text-sm text-muted">
                          {labelFor(ACT_TYPES, entry.act_type)} · {entry.document_type}
                          {entry.document_label ? ` · ${entry.document_label}` : ''}
                        </span>
                      </span>
                    </summary>
                    <div className="border-t border-rule bg-paper px-4 py-5 sm:px-5">
                      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Detail label="Identified by">{labelFor(ID_METHODS, entry.id_method)}</Detail>
                        <Detail label="Signer's address">{entry.signer_address}</Detail>
                        <Detail label="Where it was signed">{entry.signing_location}</Detail>
                        <Detail label="Fee">{entry.fee_cents != null ? `$${(entry.fee_cents / 100).toFixed(2)}` : null}</Detail>
                        <Detail label="Notes">{entry.notes}</Detail>
                        <Detail label="Your statements">{entry.attestation_text}</Detail>
                        <Detail label="Document fingerprint" mono>
                          <span title={entry.document_sha256}>{shortHash(entry.document_sha256, 16, 8)}</span>
                        </Detail>
                        <Detail label="Entry fingerprint" mono>
                          <span title={entry.journal_sha256}>{shortHash(entry.journal_sha256, 16, 8)}</span>
                        </Detail>
                        {entry.transaction_signature && (
                          <Detail label="Ledger transaction" mono>
                            <a
                              href={explorerUrl(entry.transaction_signature)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-seal underline underline-offset-2"
                            >
                              {shortHash(entry.transaction_signature, 12, 6)} ↗
                            </a>
                          </Detail>
                        )}
                      </dl>
                      {entry.transaction_signature && (
                        <div className="mt-5 border-t border-rule pt-4">
                          <EntryCheck id={entry.id} txId={entry.transaction_signature} />
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </div>
  );
}
