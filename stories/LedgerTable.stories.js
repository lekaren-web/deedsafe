import { fn } from '@storybook/test';
import LedgerTable from '../app/components/LedgerTable';
import { ledgerResponse, never, withFetch } from './mockFetch';

export default {
  title: 'Components/LedgerTable',
  component: LedgerTable,
  args: { onCheck: fn(), version: 0 },
  parameters: {
    docs: { description: { component: 'Latest records read straight from Solana through `/api/ledger`. Covers loading, empty and error states.' } },
  },
};

export const Loaded = { decorators: [withFetch(() => ({ body: ledgerResponse }))] };

export const Loading = { decorators: [withFetch(never)] };

export const Empty = { decorators: [withFetch(() => ({ body: { ...ledgerResponse, entries: [] } }))] };

export const RpcError = {
  decorators: [withFetch(() => ({ status: 502, body: { error: "Couldn't reach the Solana network. Try again in a minute." } }))],
};
