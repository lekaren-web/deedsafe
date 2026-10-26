import SiteHeader from '../app/components/SiteHeader';

export default {
  title: 'Components/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
};

export const SignedOut = { args: { home: true } };

export const SignedIn = { args: { home: true, user: { email: 'notary@example.com' } } };
