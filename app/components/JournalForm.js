'use client';
import { useState } from 'react';
import { ACT_TYPES, ATTESTATIONS, DOCUMENT_TYPES, ID_METHODS } from '../config/journal';

function localNow() {
  const d = new Date();
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const inputClass =
  'mt-1.5 w-full min-w-0 rounded-md border bg-paper px-3 py-2 text-sm text-ink focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/25';

function Field({ id, label, optional, error, hint, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

export default function JournalForm({ submitting, fieldErrors = {}, onSubmit }) {
  const [form, setForm] = useState({
    performedAt: localNow(),
    actType: 'acknowledgment',
    documentType: '',
    documentLabel: '',
    signerName: '',
    signerAddress: '',
    idMethod: 'drivers_license',
    signingLocation: '',
    fee: '',
    notes: '',
    attestedIdentity: false,
    attestedWilling: false,
  });
  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const border = (key) => (fieldErrors[key] ? 'border-bad' : 'border-rule');
  const describedBy = (key) => (fieldErrors[key] ? `j-${key}-error` : undefined);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, performedAt: new Date(form.performedAt).toISOString() });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="j-performedAt" label="Date and time" error={fieldErrors.performedAt}>
          <input
            id="j-performedAt"
            type="datetime-local"
            required
            value={form.performedAt}
            onChange={set('performedAt')}
            aria-describedby={describedBy('performedAt')}
            className={`${inputClass} ${border('performedAt')}`}
          />
        </Field>
        <Field id="j-actType" label="Notarial act" error={fieldErrors.actType}>
          <select id="j-actType" value={form.actType} onChange={set('actType')} className={`${inputClass} ${border('actType')}`}>
            {ACT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="j-documentType" label="Document type" error={fieldErrors.documentType}>
        <input
          id="j-documentType"
          list="document-types"
          required
          placeholder="e.g. Grant deed"
          value={form.documentType}
          onChange={set('documentType')}
          aria-describedby={describedBy('documentType')}
          className={`${inputClass} ${border('documentType')}`}
        />
        <datalist id="document-types">
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Field>

      <Field id="j-signerName" label="Signer's full name" error={fieldErrors.signerName}>
        <input
          id="j-signerName"
          required
          autoComplete="off"
          value={form.signerName}
          onChange={set('signerName')}
          aria-describedby={describedBy('signerName')}
          className={`${inputClass} ${border('signerName')}`}
        />
      </Field>

      <Field id="j-signerAddress" label="Signer's address" optional error={fieldErrors.signerAddress}>
        <input
          id="j-signerAddress"
          autoComplete="off"
          value={form.signerAddress}
          onChange={set('signerAddress')}
          className={`${inputClass} ${border('signerAddress')}`}
        />
      </Field>

      <Field
        id="j-idMethod"
        label="How you identified the signer"
        error={fieldErrors.idMethod}
        hint="Don't record ID numbers. Many states prohibit storing them."
      >
        <select id="j-idMethod" value={form.idMethod} onChange={set('idMethod')} className={`${inputClass} ${border('idMethod')}`}>
          {ID_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <Field id="j-signingLocation" label="Where it was signed" optional error={fieldErrors.signingLocation}>
          <input
            id="j-signingLocation"
            placeholder="City, state, or address"
            value={form.signingLocation}
            onChange={set('signingLocation')}
            className={`${inputClass} ${border('signingLocation')}`}
          />
        </Field>
        <Field id="j-fee" label="Fee" optional error={fieldErrors.fee}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-sm text-muted">$</span>
            <input
              id="j-fee"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.fee}
              onChange={set('fee')}
              className={`${inputClass} ${border('fee')} pl-6 tabular-nums`}
            />
          </div>
        </Field>
      </div>

      <Field id="j-documentLabel" label="Private label" optional hint="Your own reference, like a file or order number." error={fieldErrors.documentLabel}>
        <input id="j-documentLabel" value={form.documentLabel} onChange={set('documentLabel')} className={`${inputClass} ${border('documentLabel')}`} />
      </Field>

      <Field id="j-notes" label="Notes" optional error={fieldErrors.notes}>
        <textarea id="j-notes" rows={2} value={form.notes} onChange={set('notes')} className={`${inputClass} ${border('notes')} resize-y`} />
      </Field>

      <fieldset className="space-y-2 border-t border-rule pt-4">
        <legend className="sr-only">Your statements</legend>
        {[
          ['attestedIdentity', ATTESTATIONS.identity],
          ['attestedWilling', ATTESTATIONS.willing],
        ].map(([key, label]) => (
          <label key={key} className="grid cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] gap-2 text-sm text-ink">
            <input type="checkbox" checked={form[key]} onChange={set(key)} className="mt-0.5 h-4 w-4 accent-seal" />
            {label}
          </label>
        ))}
        {fieldErrors.attestations && <p className="text-xs text-bad">{fieldErrors.attestations}</p>}
      </fieldset>

      <button
        type="submit"
        disabled={submitting || !form.attestedIdentity || !form.attestedWilling}
        className="w-full rounded-md bg-seal px-4 py-3 text-sm font-medium text-on-seal hover:bg-seal-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Saving and recording…' : 'Save entry and record'}
      </button>
    </form>
  );
}
