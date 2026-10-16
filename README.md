# DeedSafe

Client-side document fingerprinting with a private notary journal, anchored to the Solana public ledger. Documents never leave the user's device, and journal details never go on-chain: the ledger only receives the document's SHA-256 and a salted SHA-256 of the journal entry.

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

Supabase Studio (database browser) runs at http://127.0.0.1:54323 while Supabase is up.

## Layout

- `app/api/stamp` records a journal entry and anchors its fingerprints on Solana (signed-in users).
- `app/api/ledger` searches DeedSafe records directly on the public ledger.
- `app/api/journal/[id]/verify` checks an entry against its ledger record.
- `app/journal` is the notary's private journal.
- `supabase/migrations` holds the schema, row-level security, and append-only rules.
- `docs/notary-field-guide.html` is background research on notaries, deed fraud, and compliance.

Not legal advice. Have counsel review the attestation wording in `app/config/journal.js` and the disclaimer in `app/config/brand.js` before launch.
