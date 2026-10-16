// Server-only Supabase client with the secret key. It bypasses row-level security,
// so use it only after checking who the user is, and never import it from client code.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

let admin;
export function createAdminClient() {
  admin ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
