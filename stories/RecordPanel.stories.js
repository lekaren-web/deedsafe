import { fn } from '@storybook/test';
import RecordPanel from '../app/components/RecordPanel';

export default {
  title: 'Components/RecordPanel',
  component: RecordPanel,
  args: { onRecorded: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Two-step recording flow: fingerprint the signed document, then fill in the private journal entry.',
      },
    },
  },
};

export const SignedOut = { args: { signedIn: false } };

export const SignedIn = { args: { signedIn: true } };
