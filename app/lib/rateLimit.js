// Simple per-IP limiter. It lives in one serverless instance's memory, so it is a
// speed bump, not real protection. Replace with Upstash/Supabase before launch.
const buckets = new Map();

export function isRateLimited(request, { name, windowMs = 60_000, max }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const key = `${name}:${ip}`;
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  return recent.length > max;
}
