# DeedSafe

Client-side document fingerprinting with a private notary journal, anchored to the Solana public ledger. Documents never leave the user's device, and journal details never go on-chain: the ledger only receives the document's SHA-256 and a salted SHA-256 of the journal entry.

## Why I built this

After watching The Graham Stephan Show's video "FBI Issues WARNING About Paid Off Mortgages (Protect Yourself NOW)," I started asking how anyone could protect a paid-off home from deed theft, where a scammer poses as the owner, gets a forged deed notarized, and sells or borrows against a property they don't own.

Notaries and title companies are the checkpoint in every one of those sales. But when a fraudster fakes a notary's seal, there's no quick way to check whether that notary ever handled the document. So I thought: what if every notary kept a timestamped, tamper-evident record of each document they actually handled?

That's DeedSafe. A notary fingerprints each signed document on their own device and records the fingerprint, with the time, on a public blockchain, while the signer's details stay in a private journal. Later, a title company can check a document against that record: a match shows the file existed at that moment and hasn't changed since, and a deed carrying a notary's seal with no matching record is a red flag worth a phone call.

> We don't perform the notarization. Right after a signing, the notary records a cryptographic fingerprint of the finished document, with the exact time, on a public blockchain. Change a single digit in that file and its fingerprint no longer matches, so anyone who checks it against the record can see it was altered.

DeedSafe doesn't notarize anything, verify identity, or replace the notary. It gives their work a receipt anyone can check. One limit worth knowing: a county's scanned copy will never match the original file's fingerprint, because scanning changes the file, so checks are made against the original digital document.

## Run it locally

You need Node.js 20+ and Docker Desktop (running).

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev:local            # starts local Supabase, then the app
```

Open http://localhost:3000.

### `.env.local`

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` while developing |
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` |
| `SOLANA_PRIVATE_KEY` | A devnet keypair's secret key as a JSON array. Fund it at https://faucet.solana.com (choose Devnet). |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Run `npx supabase status` after `npm run db:start` and copy `API_URL`, `PUBLISHABLE_KEY`, `SECRET_KEY`. |

Create an account from the Sign in page. Local Supabase skips email confirmation.

### Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev:local` | Start Supabase and the app |
| `npm run dev` | Start only the app (Supabase already running) |
| `npm run db:reset` | Wipe the local database and re-apply migrations |
| `npm run db:stop` | Stop local Supabase |
| `npm run lint` | Lint |
| `npm run storybook` | Component workshop at http://localhost:6007 (no Supabase or Solana needed; API responses are mocked) |
| `npm run build-storybook` | Static Storybook build in `storybook-static/` |

Supabase Studio (database browser) runs at http://127.0.0.1:54323 while Supabase is up.

## Payments (Stripe)

Plans live in `app/config/plans.js`: Free (10 entries a month), Signing Agent ($39/mo, up to 1,000 entries), and Office ($249/mo, up to 5,000 entries).

1. Create a Stripe account and copy the **test** secret key from https://dashboard.stripe.com/test/apikeys into `STRIPE_SECRET_KEY`.
2. Create the products, prices, and billing-portal settings:

   ```bash
   node --env-file=.env.local scripts/stripe-setup.mjs
   ```

   Copy the printed `STRIPE_PORTAL_CONFIGURATION_ID` into `.env.local`.
3. Forward webhooks locally with the [Stripe CLI](https://docs.stripe.com/stripe-cli) and copy the `whsec_…` secret it prints into `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Restart `npm run dev`, then subscribe from the Account page with test card `4242 4242 4242 4242`.

In production, add a webhook endpoint at `https://<your-domain>/api/webhooks/stripe` in the Stripe dashboard for `checkout.session.completed` and `customer.subscription.*` events, and set `NEXT_PUBLIC_APP_URL`.

## Layout

- `app/api/stamp` records a journal entry and anchors its fingerprints on Solana (signed-in users).
- `app/api/ledger` searches DeedSafe records directly on the public ledger.
- `app/api/journal/[id]/verify` checks an entry against its ledger record.
- `app/journal` is the notary's private journal.
- `app/account` shows the plan, usage, and billing.
- `app/api/checkout`, `app/api/billing/portal`, and `app/api/webhooks/stripe` handle subscriptions.
- `stories/` has Storybook stories for every component and state (loading, empty, errors, matches and mismatches), plus the color and type tokens.
- `supabase/migrations` holds the schema, row-level security, and append-only rules.
- `docs/notary-field-guide.html` is background research on notaries, deed fraud, and compliance.

Not legal advice. Have counsel review the attestation wording in `app/config/journal.js` and the disclaimer in `app/config/brand.js` before launch.
