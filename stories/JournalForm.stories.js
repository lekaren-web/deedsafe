import { fn } from '@storybook/test';
import JournalForm from '../app/components/JournalForm';

export default {
  title: 'Components/JournalForm',
  component: JournalForm,
  args: { onSubmit: fn(), submitting: false },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'The private notary journal entry. Server validation errors come back per field and are tied to their inputs with `aria-describedby`. Submit stays disabled until both attestations are checked.',
      },
    },
  },
};

export const Empty = {};

export const WithServerErrors = {
  args: {
    fieldErrors: {
      documentType: 'Enter the document type.',
      signerName: "Enter the signer's full name.",
      attestations: 'Confirm both statements before recording.',
    },
  },
};

export const Submitting = { args: { submitting: true } };
