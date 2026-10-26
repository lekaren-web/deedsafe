import VerifyPanel from '../app/components/VerifyPanel';
import { ledgerResponse, never, sampleEntries, withFetch } from './mockFetch';

const found = withFetch(() => ({ body: { ...ledgerResponse, mode: 'hash', entries: [sampleEntries[0]] } }));
const notFound = (mode) => withFetch(() => ({ body: { ...ledgerResponse, mode, entries: [] } }));

export default {
  title: 'Components/VerifyPanel',
  component: VerifyPanel,
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Search the ledger by fingerprint or transaction ID, or drop a file to check it. Results are announced through a polite live region.',
      },
    },
  },
};

export const Idle = { decorators: [withFetch(never)] };

export const Searching = { args: { request: { q: sampleEntries[0].hash } }, decorators: [withFetch(never)] };

export const RecordFound = { args: { request: { q: sampleEntries[0].hash } }, decorators: [found] };

export const FileMatches = {
  args: { request: { q: sampleEntries[0].hash, source: { fileName: 'Grant deed - 123 Main St.pdf' } } },
  decorators: [found],
};

export const NoRecordForFile = {
  args: { request: { q: sampleEntries[0].hash, source: { fileName: 'Grant deed (scanned).pdf' } } },
  decorators: [notFound('hash')],
};

export const NoRecordForFingerprint = { args: { request: { q: sampleEntries[1].hash } }, decorators: [notFound('hash')] };

export const UnknownTransaction = { args: { request: { q: sampleEntries[0].signature } }, decorators: [notFound('signature')] };

export const SearchError = {
  args: { request: { q: 'not-a-hash' } },
  decorators: [withFetch(() => ({ status: 400, body: { error: 'Enter a 64-character fingerprint or a transaction ID.' } }))],
};
