import LedgerApp from '../app/components/LedgerApp';
import SiteHeader from '../app/components/SiteHeader';
import { ledgerResponse, withFetch } from './mockFetch';

export default {
  title: 'Pages/Home',
  component: LedgerApp,
  parameters: { layout: 'fullscreen' },
  decorators: [withFetch(() => ({ body: ledgerResponse }))],
  render: (args) => (
    <div className="min-h-screen bg-paper">
      <SiteHeader home user={args.signedIn ? { email: 'notary@example.com' } : null} />
      <LedgerApp
        {...args}
        intro={
          <>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-ink">A public timestamp for every document you sign off on.</h1>
            <p className="mt-4 max-w-[52ch] text-muted">
              Fingerprint a document on your device and record it on Solana. The file never leaves your computer.
            </p>
          </>
        }
      />
    </div>
  ),
};

export const SignedOut = { args: { signedIn: false } };

export const SignedIn = { args: { signedIn: true } };
