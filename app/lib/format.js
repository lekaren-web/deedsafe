export function shortHash(hash, head = 10, tail = 6) {
  return hash ? `${hash.slice(0, head)}…${hash.slice(-tail)}` : '';
}

export function formatTime(blockTime) {
  if (!blockTime) return 'Time pending';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(blockTime * 1000)
  );
}
