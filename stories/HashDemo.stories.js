import { expect, userEvent, within } from '@storybook/test';
import HashDemo from '../app/components/HashDemo';

export default {
  title: 'Components/HashDemo',
  component: HashDemo,
  parameters: {
    docs: {
      description: {
        component: 'Explains fingerprints by example: edit the deed text and the changed characters of the hash light up.',
      },
    },
  },
};

export const Matches = {};

export const OneCharacterChanged = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByLabelText(/change the sale price/i);
    await userEvent.type(box, '!');
    await expect(await canvas.findByText(/of 64 characters changed/, {}, { timeout: 3000 })).toBeInTheDocument();
  },
};
