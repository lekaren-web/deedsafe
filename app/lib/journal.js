// Server-only journal helpers: validation and the salted commitment that goes on-chain.
import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ACT_TYPES, ATTESTATION_TEXT, ID_METHODS } from '../config/journal';

const HASH_PATTERN = /^[0-9a-f]{64}$/;
const MAX_FUTURE_MS = 10 * 60 * 1000;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Every field that the on-chain journal fingerprint covers, in a fixed order.
const COMMITTED_FIELDS = [
  'id',
  'notary_id',
  'network',
  'performed_at',
  'act_type',
  'document_type',
  'document_label',
  'signer_name',
  'signer_address',
  'id_method',
  'signing_location',
  'fee_cents',
  'notes',
  'attested_identity',
  'attested_willing',
  'attestation_text',
  'document_sha256',
  'journal_salt',
];

function text(value, max, { required = false } = {}) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) return required ? { error: true } : { value: null };
  if (v.length > max) return { error: true };
  return { value: v };
}

// Turns the form body into a journal row (without ids, salt, or commitment).
export function validateEntry(body) {
  const errors = {};
  const entry = {};

  const doc = typeof body.documentSha256 === 'string' ? body.documentSha256.toLowerCase() : '';
  if (!HASH_PATTERN.test(doc)) errors.documentSha256 = 'Fingerprint the document first.';
  entry.document_sha256 = doc;

  const performed = new Date(body.performedAt);
  const age = Date.now() - performed.getTime();
  if (Number.isNaN(performed.getTime())) errors.performedAt = 'Enter when the notarization happened.';
  else if (age < -MAX_FUTURE_MS) errors.performedAt = "That time is in the future.";
  else if (age > MAX_AGE_MS) errors.performedAt = 'Record entries within 30 days of the notarization.';
  else entry.performed_at = performed.toISOString();

  if (!ACT_TYPES.some((t) => t.value === body.actType)) errors.actType = 'Choose the notarial act.';
  entry.act_type = body.actType;
  if (!ID_METHODS.some((m) => m.value === body.idMethod)) errors.idMethod = 'Choose how you identified the signer.';
  entry.id_method = body.idMethod;

  const fields = [
    ['documentType', 'document_type', 120, true, 'Enter the document type.'],
    ['documentLabel', 'document_label', 200, false, 'Keep the label under 200 characters.'],
    ['signerName', 'signer_name', 200, true, "Enter the signer's full name."],
    ['signerAddress', 'signer_address', 300, false, 'Keep the address under 300 characters.'],
    ['signingLocation', 'signing_location', 300, false, 'Keep the location under 300 characters.'],
    ['notes', 'notes', 2000, false, 'Keep notes under 2,000 characters.'],
  ];
  for (const [input, column, max, required, message] of fields) {
    const result = text(body[input], max, { required });
    if (result.error) errors[input] = message;
    entry[column] = result.value;
  }

  if (body.fee === '' || body.fee == null) entry.fee_cents = null;
  else {
    const dollars = Number(body.fee);
    if (!Number.isFinite(dollars) || dollars < 0 || dollars > 100000) errors.fee = 'Enter a fee between $0 and $100,000.';
    else entry.fee_cents = Math.round(dollars * 100);
  }

  if (body.attestedIdentity !== true || body.attestedWilling !== true) {
    errors.attestations = 'Confirm both statements to record this entry.';
  }
  entry.attested_identity = true;
  entry.attested_willing = true;
  entry.attestation_text = ATTESTATION_TEXT;

  return Object.keys(errors).length ? { errors } : { entry };
}

export function newEntryKeys() {
  return { id: randomUUID(), journal_salt: randomBytes(16).toString('hex') };
}

// Salted SHA-256 over the committed fields. The salt keeps anyone from confirming a
// guessed name or address against the public ledger.
export function journalCommitment(entry) {
  const canonical = {};
  for (const field of COMMITTED_FIELDS) {
    let value = entry[field] ?? null;
    if (field === 'performed_at' && value) value = new Date(value).toISOString();
    if (typeof value === 'string' && field.endsWith('sha256')) value = value.trim();
    canonical[field] = value;
  }
  return createHash('sha256').update(`DeedSafe journal v1\n${JSON.stringify(canonical)}`).digest('hex');
}
