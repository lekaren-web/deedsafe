import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import SiteHeader from '../components/SiteHeader';
import { getUser } from '../lib/supabase/server';
import { safeNext } from '../lib/safeNext';

export const metadata = { title: 'Sign in · DeedSafe' };

export default async function LoginPage({ searchParams }) {
  const next = safeNext((await searchParams).next);
  if (await getUser()) redirect(next);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:py-20">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">For signing agents</p>
          <h1 className="mt-4 max-w-[18ch] font-serif text-4xl font-semibold leading-[1.1] text-balance text-ink">
            Your journal, with a public receipt for every entry.
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
            Signer names, addresses, and ID details stay in your private journal. Only fingerprints go on the public
            ledger, so you can prove an entry existed and hasn&apos;t changed without revealing what&apos;s in it.
          </p>
        </div>
        <LoginForm next={next} />
      </main>
    </div>
  );
}
