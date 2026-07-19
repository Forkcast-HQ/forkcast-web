"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supa, cloudEnabled } from "./supabase";
import { pushAccount } from "./cloud";

// Auth layer with two modes:
// - CLOUD (Supabase env keys present): real email/password accounts via
//   Supabase Auth; sessions persist across devices; a local mirror of the
//   account keeps the rest of the app unchanged.
// - DEMO (no keys): the original device-local accounts in localStorage.
// The UI is identical in both modes; `cloud` on the context tells screens
// which one is live so demo-only affordances (on-screen reset) can adapt.

export type AccountRole = "customer" | "restaurant";

export interface Account {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // demo mode only; cloud accounts store "cloud"
  role?: AccountRole; // default "customer" (accounts created before roles existed)
  createdAt: number;
}

type AuthResult = { ok: boolean; error?: string; info?: string };

interface AuthValue {
  hydrated: boolean;
  cloud: boolean; // true when Supabase is configured
  user: Account | null;
  signUp: (input: { name: string; email: string; password: string; role?: AccountRole }) => Promise<AuthResult>;
  logIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  logOut: () => void;
  updateName: (name: string) => void;
  // Demo mode: immediate on-device reset. Cloud mode: sends the standard
  // email-verified reset link via Supabase.
  resetPassword: (input: { email: string; newPassword: string }) => Promise<AuthResult>;
}

const ACCOUNTS_KEY = "forkcast.accounts";
const SESSION_KEY = "forkcast.session";

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
const pwHash = (pw: string) => hash(pw + "::forkcast.v1");
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const cloud = cloudEnabled();

  const persistAccounts = useCallback((next: Account[]) => {
    setAccounts(next);
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const setSession = useCallback((id: string | null) => {
    setUserId(id);
    try {
      if (id) localStorage.setItem(SESSION_KEY, id);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Mirror a cloud user into the local account list (id = Supabase user id),
  // so every store keyed by user id works identically in both modes.
  const mirrorCloudAccount = useCallback(
    (list: Account[], id: string, email: string, name: string, role: AccountRole): Account[] => {
      const existing = list.find((a) => a.id === id);
      const acc: Account = existing
        ? { ...existing, email, name: name || existing.name, role: role ?? existing.role }
        : { id, name, email, passwordHash: "cloud", role, createdAt: Date.now() };
      return existing ? list.map((a) => (a.id === id ? acc : a)) : [...list, acc];
    },
    [],
  );

  useEffect(() => {
    let local: Account[] = [];
    try {
      const a = localStorage.getItem(ACCOUNTS_KEY);
      const s = localStorage.getItem(SESSION_KEY);
      if (a) local = JSON.parse(a);
      setAccounts(local);
      if (s) setUserId(s);
    } catch {
      /* ignore */
    }

    const s = supa();
    if (!s) {
      setHydrated(true);
      return;
    }
    // Cloud mode: the Supabase session is authoritative.
    s.auth
      .getSession()
      .then(({ data }) => {
        const u = data.session?.user;
        if (u) {
          const meta = (u.user_metadata ?? {}) as { name?: string; role?: AccountRole };
          const next = mirrorCloudAccount(local, u.id, u.email ?? "", meta.name ?? "", meta.role ?? "customer");
          persistAccounts(next);
          setSession(u.id);
        }
      })
      .finally(() => setHydrated(true));
  }, [mirrorCloudAccount, persistAccounts, setSession]);

  const signUp: AuthValue["signUp"] = useCallback(
    async ({ name, email, password, role }) => {
      const e = email.trim().toLowerCase();
      if (!e || !e.includes("@")) return { ok: false, error: "Enter a valid email." };
      if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

      const s = supa();
      if (s) {
        const { data, error } = await s.auth.signUp({
          email: e,
          password,
          options: { data: { name: name.trim(), role: role ?? "customer" } },
        });
        if (error) return { ok: false, error: error.message };
        const u = data.user;
        if (!u) return { ok: false, error: "Sign-up failed. Try again." };
        persistAccounts(mirrorCloudAccount(accounts, u.id, e, name.trim(), role ?? "customer"));
        if (!data.session) {
          // Email confirmation is enabled on the project — no session yet.
          return { ok: true, info: "Check your email to confirm your account, then log in." };
        }
        setSession(u.id);
        pushAccount(u.id, name.trim(), role ?? "customer");
        return { ok: true };
      }

      if (accounts.some((a) => a.email === e)) return { ok: false, error: "An account with that email already exists." };
      const acc: Account = { id: uid(), name: name.trim(), email: e, passwordHash: pwHash(password), role: role ?? "customer", createdAt: Date.now() };
      persistAccounts([...accounts, acc]);
      setSession(acc.id);
      return { ok: true };
    },
    [accounts, mirrorCloudAccount, persistAccounts, setSession],
  );

  const logIn: AuthValue["logIn"] = useCallback(
    async ({ email, password }) => {
      const e = email.trim().toLowerCase();

      const s = supa();
      if (s) {
        const { data, error } = await s.auth.signInWithPassword({ email: e, password });
        if (error) return { ok: false, error: error.message };
        const u = data.user;
        if (!u) return { ok: false, error: "Log-in failed. Try again." };
        const meta = (u.user_metadata ?? {}) as { name?: string; role?: AccountRole };
        persistAccounts(mirrorCloudAccount(accounts, u.id, e, meta.name ?? "", meta.role ?? "customer"));
        setSession(u.id);
        return { ok: true };
      }

      const acc = accounts.find((a) => a.email === e);
      if (!acc || acc.passwordHash !== pwHash(password)) return { ok: false, error: "Wrong email or password." };
      setSession(acc.id);
      return { ok: true };
    },
    [accounts, mirrorCloudAccount, persistAccounts, setSession],
  );

  const logOut = useCallback(() => {
    supa()?.auth.signOut().catch(() => {});
    setSession(null);
  }, [setSession]);

  const resetPassword: AuthValue["resetPassword"] = useCallback(
    async ({ email, newPassword }) => {
      const e = email.trim().toLowerCase();

      const s = supa();
      if (s) {
        const { error } = await s.auth.resetPasswordForEmail(e);
        if (error) return { ok: false, error: error.message };
        return { ok: true, info: "Password-reset email sent. Follow the link in your inbox." };
      }

      const acc = accounts.find((a) => a.email === e);
      if (!acc) return { ok: false, error: "No account with that email exists on this device." };
      if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
      persistAccounts(accounts.map((a) => (a.id === acc.id ? { ...a, passwordHash: pwHash(newPassword) } : a)));
      return { ok: true };
    },
    [accounts, persistAccounts],
  );

  const updateName = useCallback(
    (name: string) => {
      if (!userId) return;
      persistAccounts(accounts.map((a) => (a.id === userId ? { ...a, name: name.trim() } : a)));
      const s = supa();
      if (s) {
        s.auth.updateUser({ data: { name: name.trim() } }).catch(() => {});
        const acc = accounts.find((a) => a.id === userId);
        pushAccount(userId, name.trim(), acc?.role ?? "customer");
      }
    },
    [userId, accounts, persistAccounts],
  );

  const user = accounts.find((a) => a.id === userId) ?? null;

  return (
    <Ctx.Provider value={{ hydrated, cloud, user, signUp, logIn, logOut, updateName, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
