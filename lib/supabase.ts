// Supabase client — created only when NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY are present at build time. Without them the
// whole app runs exactly as before (device-local demo mode); every cloud
// call site checks `supa()` and no-ops on null.
//
// The anon key is public by design (it ships in the browser bundle); data is
// protected by row-level security in supabase/migrations/0001_init.sql.
// NEVER put the service_role key in client code or NEXT_PUBLIC_* vars.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function supa(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    url && key
      ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
      : null;
  return client;
}

export const cloudEnabled = (): boolean => supa() !== null;
