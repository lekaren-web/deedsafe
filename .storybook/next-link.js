// Storybook stand-in for next/link: a plain anchor, so components render outside the Next.js router.
export default function Link({ href, children, prefetch, replace, scroll, shallow, ...rest }) {
  return (
    <a href={typeof href === 'string' ? href : href.pathname} {...rest}>
      {children}
    </a>
  );
}
