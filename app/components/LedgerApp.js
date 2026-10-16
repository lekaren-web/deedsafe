'use client';
import { useEffect, useState } from 'react';
import LedgerTable from './LedgerTable';
import RecordPanel from './RecordPanel';
import VerifyPanel from './VerifyPanel';

const MODES = [
  { id: 'verify', label: 'Verify a document' },
  { id: 'record', label: 'Record a signing' },
];

export default function LedgerApp({ intro, signedIn }) {
  const [mode, setMode] = useState('verify');
  const [verifyRequest, setVerifyRequest] = useState(null);
  const [ledgerVersion, setLedgerVersion] = useState(0);

  // Verification links look like /?q=<transaction or fingerprint>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setVerifyRequest({ q });
    else if (params.get('tab') === 'record') setMode('record');
  }, []);

  const checkFromLedger = (hash) => {
    setMode('verify');
    setVerifyRequest({ q: hash });
    document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:pt-20">
        <div className="min-w-0">{intro}</div>

        <div id="tool" className="min-w-0 self-start scroll-mt-6 rounded-md border border-rule bg-sheet shadow-[0_1px_0_var(--color-rule),0_12px_32px_-16px_rgb(27_32_51/0.25)]">
          <div role="tablist" aria-label="What do you want to do?" className="grid grid-cols-2 border-b border-rule">
            {MODES.map((m) => (
              <button
                key={m.id}
                role="tab"
                id={`tab-${m.id}`}
                aria-selected={mode === m.id}
                aria-controls={`panel-${m.id}`}
                onClick={() => setMode(m.id)}
                className={`-mb-px border-b-2 px-4 py-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-seal ${
                  mode === m.id ? 'border-seal text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-6">
            <div role="tabpanel" id="panel-verify" aria-labelledby="tab-verify" hidden={mode !== 'verify'}>
              <VerifyPanel request={verifyRequest} />
            </div>
            <div role="tabpanel" id="panel-record" aria-labelledby="tab-record" hidden={mode !== 'record'}>
              <RecordPanel signedIn={signedIn} onRecorded={() => setLedgerVersion((v) => v + 1)} />
            </div>
          </div>
        </div>
      </section>

      <section id="ledger" className="border-y border-rule bg-sheet/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <LedgerTable version={ledgerVersion} onCheck={checkFromLedger} />
        </div>
      </section>
    </>
  );
}
