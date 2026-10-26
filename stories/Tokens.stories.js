const groups = [
  ['Surfaces', ['paper', 'sheet', 'rule']],
  ['Text', ['ink', 'muted']],
  ['Accent', ['seal', 'seal-strong', 'seal-soft', 'on-seal']],
  ['Result states', ['good', 'good-soft', 'warn', 'warn-soft', 'bad', 'bad-soft']],
];

function Tokens() {
  return (
    <div className="space-y-8">
      <p className="max-w-[60ch] text-sm text-muted">
        Color tokens from <code className="font-mono">app/globals.css</code>, defined with Tailwind 4&apos;s <code className="font-mono">@theme</code>.
        Components only use these names, so the dark palette (under <code className="font-mono">prefers-color-scheme</code>) needs no component changes.
        Good, warn and bad are reserved for result states.
      </p>
      {groups.map(([title, names]) => (
        <section key={title}>
          <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
            {names.map((name) => (
              <div key={name} className="overflow-hidden rounded-md border border-rule bg-sheet">
                <div className="h-14 border-b border-rule" style={{ background: `var(--color-${name})` }} />
                <p className="px-3 py-2 font-mono text-xs text-ink">--color-{name}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h2 className="font-serif text-lg font-semibold text-ink">Type</h2>
        <p className="mt-3 font-serif text-3xl font-semibold text-ink">IBM Plex Serif for headings</p>
        <p className="mt-2 text-base text-ink">IBM Plex Sans for interface text and body copy.</p>
        <p className="mt-2 font-mono text-sm text-ink">IBM Plex Mono for fingerprints: 3f9a1c…e04b72</p>
      </section>
    </div>
  );
}

export default { title: 'Foundations/Tokens', component: Tokens };

export const Colors = {};
