import { fn } from '@storybook/test';
import FileHasher from '../app/components/FileHasher';

export default {
  title: 'Components/FileHasher',
  component: FileHasher,
  args: { onHashGenerated: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Drop zone that fingerprints a file with SHA-256 in the browser (Web Crypto). The file is never uploaded. A real file input covers the zone, so it works with the keyboard and screen readers, and the focus ring shows through `:has(input:focus-visible)`.',
      },
    },
  },
};

export const Default = {};

export const Compact = {
  args: { compact: true, title: 'Drop the document to check', hint: 'We fingerprint it here and look for a matching record.' },
};
