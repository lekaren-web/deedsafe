'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

export default function LoginForm({ next }) {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading' });
    const supabase = createClient();
    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${next}` } });

    if (error) return setState({ status: 'error', error: error.message });
    if (mode === 'signup' && !data.session) {
      return setState({ status: 'check-email' });
    }
    router.replace(next);
    router.refresh();
  };

  const isSignIn = mode === 'signin';

  return (
    <div className="min-w-0 self-start rounded-md border border-rule bg-sheet p-6 shadow-[0_1px_0_var(--color-rule),0_12px_32px_-16px_rgb(27_32_51/0.25)]">
      <h2 className="font-serif text-2xl font-semibold text-ink">{isSignIn ? 'Sign in' : 'Create your account'}</h2>
      {state.status === 'check-email' ? (
        <p className="mt-4 rounded-md bg-good-soft px-4 py-3 text-sm text-ink">
          Check {email} for a confirmation link, then come back and sign in.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-rule bg-paper px-3 py-2.5 text-sm text-ink focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/25"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={10}
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-rule bg-paper px-3 py-2.5 text-sm text-ink focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/25"
            />
            {!isSignIn && <p className="mt-1 text-xs text-muted">At least 10 characters.</p>}
          </div>
          {state.status === 'error' && <p className="text-sm text-bad">{state.error}</p>}
          <button
            type="submit"
            disabled={state.status === 'loading'}
            className="w-full rounded-md bg-seal px-4 py-3 text-sm font-medium text-on-seal hover:bg-seal-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal disabled:opacity-60"
          >
            {state.status === 'loading' ? 'One moment…' : isSignIn ? 'Sign in' : 'Create account'}
          </button>
        </form>
      )}
      <p className="mt-5 text-sm text-muted">
        {isSignIn ? 'New to DeedSafe?' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(isSignIn ? 'signup' : 'signin');
            setState({ status: 'idle' });
          }}
          className="text-seal underline underline-offset-2"
        >
          {isSignIn ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
