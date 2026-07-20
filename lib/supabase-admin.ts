// Service-role Supabase client — SERVER ONLY.
//
// Every other client in this app (lib/supabase.ts) uses the anon key and
// relies on row-level security to scope access to auth.uid(). This client
// bypasses RLS entirely, which is required for the Google Health / Fitbit
// OAuth flow: the callback route is a plain browser redirect from Google
// with no Authorization header, so there is no live user session to scope
// an RLS-enforced client to (see supabase/migrations/0004_device_connections.sql).
//
// DO NOT import this file from any "use client" component or anything that
// ships to the browser — only from app/api/health/** route handlers. Do not
// prefix the underlying env var with NEXT_PUBLIC_.
//
// Requires SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API →
// "service_role" secret) in .env.local / Vercel env vars. See
// docs/GOOGLE_HEALTH_SETUP.md for the full setup walkthrough.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function supaAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}
