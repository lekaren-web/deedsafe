// Only allow same-site relative paths as post-login destinations.
export function safeNext(value, fallback = '/journal') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}
