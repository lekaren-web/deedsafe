-- DeedSafe: notary profiles and private journal entries.
-- Personal details live only here. The public ledger only ever sees two hashes:
-- the document's SHA-256 and a salted SHA-256 commitment of the journal entry.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'signing_agent' check (role in ('signing_agent', 'title_team')),
  billing_status text not null default 'free'
    check (billing_status in ('free', 'active_subscriber', 'past_due', 'canceled')),
  referred_by_rep_id uuid,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Create a profile row for every new auth user.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.journal_entries (
  id uuid primary key,
  -- restrict: a notary's account can't be deleted while their journal must be retained
  notary_id uuid not null references public.profiles (id) on delete restrict,

  performed_at timestamptz not null,
  act_type text not null
    check (act_type in ('acknowledgment', 'jurat', 'oath_affirmation', 'copy_certification', 'other')),
  document_type text not null check (char_length(document_type) between 1 and 120),
  document_label text check (char_length(document_label) <= 200),
  signer_name text not null check (char_length(signer_name) between 1 and 200),
  signer_address text check (char_length(signer_address) <= 300),
  -- How identity was established. ID numbers are never stored.
  id_method text not null
    check (id_method in ('drivers_license', 'state_id', 'passport', 'military_id',
                         'credible_witness', 'personal_knowledge', 'other')),
  signing_location text check (char_length(signing_location) <= 300),
  fee_cents integer check (fee_cents between 0 and 10000000),
  notes text check (char_length(notes) <= 2000),

  -- What the notary attested to, and the exact wording they saw.
  attested_identity boolean not null check (attested_identity),
  attested_willing boolean not null check (attested_willing),
  attestation_text text not null,

  document_sha256 char(64) not null check (document_sha256 ~ '^[0-9a-f]{64}$'),
  -- Random salt so the public commitment can't be reversed by guessing names or addresses.
  journal_salt char(32) not null check (journal_salt ~ '^[0-9a-f]{32}$'),
  journal_sha256 char(64) not null check (journal_sha256 ~ '^[0-9a-f]{64}$'),

  status text not null default 'pending' check (status in ('pending', 'recorded', 'failed')),
  network text not null,
  transaction_signature text unique,
  slot bigint,
  recorded_at timestamptz,
  created_at timestamptz not null default now()
);

create index journal_entries_notary_performed_idx on public.journal_entries (notary_id, performed_at desc);
create index journal_entries_document_idx on public.journal_entries (document_sha256);

alter table public.journal_entries enable row level security;

-- Notaries can read only their own journal. All writes go through the server
-- (service role), so users can't edit entries or forge recording status directly.
create policy "Notaries can read their own journal"
  on public.journal_entries for select
  using (notary_id = auth.uid());

-- Journal entries are append-only. The only change allowed is recording the
-- ledger result on a pending entry.
create function public.guard_journal_entry() returns trigger
language plpgsql set search_path = '' as $$
declare
  ledger_fields text[] := array['status', 'transaction_signature', 'slot', 'recorded_at'];
begin
  if tg_op = 'DELETE' then
    raise exception 'Journal entries cannot be deleted';
  end if;
  if old.status <> 'pending' then
    raise exception 'Journal entries cannot be changed after recording';
  end if;
  if (to_jsonb(new) - ledger_fields) is distinct from (to_jsonb(old) - ledger_fields) then
    raise exception 'Only the ledger result of a journal entry can be updated';
  end if;
  return new;
end;
$$;

create trigger journal_entries_append_only
  before update or delete on public.journal_entries
  for each row execute function public.guard_journal_entry();
