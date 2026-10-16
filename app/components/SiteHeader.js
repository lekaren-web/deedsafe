import Link from 'next/link';
import { BRAND_CONFIG } from '../config/brand';
import { DEEDSAFE_CONSTANTS } from '../config/constants';

const { network } = DEEDSAFE_CONSTANTS.blockchain;

export function SealMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={`${className} text-seal`} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2" />
      <path d="M14 21.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SiteHeader({ user, home = false }) {
  const anchor = (id) => (home ? `#${id}` : `/#${id}`);
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <SealMark />
          <span className="font-serif text-xl font-semibold tracking-tight">{BRAND_CONFIG.name}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted sm:gap-5">
          <a href={anchor('ledger')} className="hidden hover:text-ink md:inline">Ledger</a>
          <a href={anchor('pricing')} className="hidden hover:text-ink md:inline">Pricing</a>
          {user ? (
            <>
              <Link href="/journal" className="font-medium text-ink hover:text-seal">My journal</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="hover:text-ink">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="font-medium text-ink hover:text-seal">Sign in</Link>
          )}
          {network !== 'mainnet-beta' && (
            <span className="hidden rounded-full bg-warn-soft px-2.5 py-0.5 font-mono text-[11px] text-warn sm:inline" title="Records on this site are test records">
              {network} · test records
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
