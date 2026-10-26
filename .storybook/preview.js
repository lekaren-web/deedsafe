import '../app/globals.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <div className="font-sans text-ink antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
