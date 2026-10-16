// Journal options shared by the entry form and the server. Values are stored; labels are shown.
export const ACT_TYPES = [
  { value: 'acknowledgment', label: 'Acknowledgment' },
  { value: 'jurat', label: 'Jurat' },
  { value: 'oath_affirmation', label: 'Oath or affirmation' },
  { value: 'copy_certification', label: 'Copy certification' },
  { value: 'other', label: 'Other' },
];

export const ID_METHODS = [
  { value: 'drivers_license', label: "Driver's license" },
  { value: 'state_id', label: 'State ID card' },
  { value: 'passport', label: 'Passport' },
  { value: 'military_id', label: 'Military ID' },
  { value: 'credible_witness', label: 'Credible witness' },
  { value: 'personal_knowledge', label: 'Personal knowledge' },
  { value: 'other', label: 'Other' },
];

export const DOCUMENT_TYPES = [
  'Grant deed',
  'Warranty deed',
  'Quitclaim deed',
  'Deed of trust',
  'Mortgage',
  'Power of attorney',
  'Affidavit',
  'Loan package',
];

// TODO(legal): have counsel review this wording before launch. The exact text the
// notary saw is stored with each entry and included in its fingerprint.
export const ATTESTATIONS = {
  identity: 'I identified the signer using the method recorded above.',
  willing: 'The signer appeared before me and signed willingly.',
};
export const ATTESTATION_TEXT = `${ATTESTATIONS.identity} ${ATTESTATIONS.willing}`;

export const labelFor = (options, value) => options.find((o) => o.value === value)?.label ?? value;
