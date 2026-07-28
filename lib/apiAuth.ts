// Server-side identity check for API routes — new as of the Google
// Health / Fitbit integration. Every route in this app before this feature
// was stateless (app/api/analyze, app/api/chat); this is the first place
// a route needs to know "which signed-in Palatify user is calling."
//
// Convention: the client attaches the current Supabase session's access
// token as `Authorization: Bearer <token>` (grabbed via
// supa()?.auth.getSession() — see lib/health.ts). The anon-key client can
// verify that token server-side with auth.getUser(token) without needing
// the service-role key — this keeps the "anon key + RLS" philosophy intact
// for identity checks; the service-role client (lib/supabase-admin.ts) is
// only reached for once identity is confirmed.

import { createClient } from "@supabase/supabase-js";

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
