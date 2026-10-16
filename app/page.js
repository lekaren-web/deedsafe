import HashDemo from './components/HashDemo';
import LedgerApp from './components/LedgerApp';
import SiteHeader from './components/SiteHeader';
import { BRAND_CONFIG } from './config/brand';
import { DEEDSAFE_CONSTANTS } from './config/constants';
import { getUser } from './lib/supabase/server';

const { pricing } = DEEDSAFE_CONSTANTS;

const FACTS = [
  ['Fingerprint', 'SHA-256, computed in your browser'],
  ['Ledger', 'Solana, public and permanent'],
  ['Files uploaded', 'None, ever'],
  ['Cost per record', 'About $0.001'],
];

const STEPS = [
  {
    title: 'Fingerprint the signed document',
    body: 'Your browser turns the file into a 64-character code. The same file always gives the same code, and changing even one character gives a different one.',
  },
  {
    title: 'Fill in your journal entry',
    body: 'Signer, act, and ID method go into your private journal. DeedSafe writes only two fingerprints to the Solana ledger: the document\'s and the entry\'s. The network adds the official time.',
  },
  {
    title: 'Check it later',
    body: 'A title company, attorney, or court can fingerprint the original file again and compare. A match proves it existed by that time, unchanged.',
  },
];

const AUDIENCES = [
  {
    who: 'Signing agents',
    line: 'If your seal is ever forged, show exactly which signings you handled.',
    points: [
      'Keep your notary journal and your proof in one place',
      'A deed with your seal but no matching record stands out',
      'Share a verification link with the title company',
    ],
  },
  {
    who: 'Title & escrow teams',
    line: 'Before closing, check a document against what the signing agent recorded.',
    points: [
      'Confirm the file hasn’t changed since it was signed',
      'Spot documents your signing agents never recorded',
      'Every check is verifiable without trusting DeedSafe',
    ],
  },
];

const TIERS = [
  {
    name: 'Signing agent',
    price: pricing.notaryMonthlyPrice,
    detail: 'For one notary',
    features: ['Unlimited records', 'Verification links for every signing', 'Your full record history'],
  },
  {
    name: 'Title & escrow team',
    price: pricing.titleEnterprisePrice,
    detail: 'For your whole office',
    features: ['Everything for signing agents', 'Shared team history and checks', 'Priority support'],
  },
];

function Intro() {
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">For signing agents and title teams</p>
      <h1 className="mt-4 max-w-[16ch] font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-balance text-ink sm:text-5xl">
        Prove which documents you handled, and when.
      </h1>
      <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
        DeedSafe fingerprints each signed document on your device and records that fingerprint on a public ledger.
        Anyone can check it later. Your files are never uploaded.
      </p>
      <dl className="mt-10 hidden max-w-xl grid-cols-2 border-t border-rule lg:grid">
        {FACTS.map(([label, value]) => (
          <div key={label} className="border-b border-rule py-3 odd:pr-6">
            <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</dt>
            <dd className="mt-0.5 text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export default async function Home() {
  const user = await getUser();
  return (
    <div className="min-h-screen">
      <SiteHeader user={user} home />

      <main>
        <LedgerApp intro={<Intro />} signedIn={Boolean(user)} />

        <section id="how" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-semibold text-ink">How it works</h2>
              <ol className="mt-6 space-y-6">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                    <span className="font-mono text-sm text-seal">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="font-medium text-ink">{step.title}</h3>
                      <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-8 max-w-[60ch] border-l-2 border-rule pl-4 text-sm leading-relaxed text-muted">
                A record proves what a file contained and when. It doesn&apos;t prove who signed it. Identity checks are
                still the signing agent&apos;s job.
              </p>
            </div>
            <div className="min-w-0">
              <HashDemo />
            </div>
          </div>
        </section>

        <section className="border-y border-rule bg-sheet/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
            {AUDIENCES.map((a) => (
              <div key={a.who} className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">{a.who}</p>
                <p className="mt-3 max-w-[30ch] font-serif text-xl font-semibold leading-snug text-ink">{a.line}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {a.points.map((p) => (
                    <li key={p} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2">
                      <span aria-hidden="true" className="text-seal">—</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink">Pricing</h2>
          <p className="mt-1 text-sm text-muted">Monthly plans. Subscriptions open soon.</p>
          <div className="mt-6 grid overflow-hidden rounded-md border border-rule bg-sheet md:grid-cols-2">
            {TIERS.map((tier, i) => (
              <div key={tier.name} className={`flex flex-col p-6 ${i > 0 ? 'border-t border-rule md:border-l md:border-t-0' : ''}`}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium text-ink">{tier.name}</h3>
                  <p className="text-xs text-muted">{tier.detail}</p>
                </div>
                <p className="mt-3 font-serif text-3xl font-semibold text-ink">
                  ${tier.price.toFixed(0)}
                  <span className="font-sans text-sm font-normal text-muted"> / month</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                  {tier.features.map((f) => (
                    <li key={f} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2">
                      <span aria-hidden="true" className="text-seal">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled
                  className="mt-6 rounded-md border border-rule px-4 py-2.5 text-sm font-medium text-muted"
                >
                  Coming soon
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-muted sm:px-6">
          <p className="max-w-[90ch]">{BRAND_CONFIG.disclaimer}</p>
          <p className="mt-3">© {new Date().getFullYear()} {BRAND_CONFIG.legalEntity}</p>
        </div>
      </footer>
    </div>
  );
}
