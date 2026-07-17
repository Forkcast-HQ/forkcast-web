"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// NOTE: This is a client-only, demo-grade auth layer (accounts live in
// localStorage). It is realistic UX — sign up, log in, log out, multiple
// accounts, per-user data — but NOT production security. Swap for a real
// backend (e.g. Auth.js + a database) when going live; the UI won't change.

export type AccountRole = "customer" | "restaurant";

export interface Account {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: AccountRole; // default "customer" (accounts created before roles existed)
  createdAt: number;
}

interface AuthValue {
  hydrated: boolean;
  user: Account | null;
  signUp: (input: { name: string; email: string; password: string; role?: AccountRole }) => { ok: boolean; error?: string };
  logIn: (input: { email: string; password: string }) => { ok: boolean; error?: string };
  logOut: () => void;
  updateName: (name: string) => void;
  // Demo-grade reset: accounts live only on this device, so the reset is
  // immediate (no email round-trip). Production swaps this for a real
  // email-verified reset flow without changing the UI.
  resetPassword: (input: { email: string; newPassword: string }) => { ok: boolean; error?: string };
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

  useEffect(() => {
    try {
      const a = localStorage.getItem(ACCOUNTS_KEY);
      const s = localStorage.getItem(SESSION_KEY);
      if (a) setAccounts(JSON.parse(a));
      if (s) setUserId(s);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

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

  const signUp: AuthValue["signUp"] = useCallback(
    ({ name, email, password, role }) => {
      const e = email.trim().toLowerCase();
      if (!e || !e.includes("@")) return { ok: false, error: "Enter a valid email." };
      if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
      if (accounts.some((a) => a.email === e)) return { ok: false, error: "An account with that email already exists." };
      const acc: Account = { id: uid(), name: name.trim(), email: e, passwordHash: pwHash(password), role: role ?? "customer", createdAt: Date.now() };
      persistAccounts([...accounts, acc]);
      setSession(acc.id);
      return { ok: true };
    },
    [accounts, persistAccounts, setSession],
  );

  const logIn: AuthValue["logIn"] = useCallback(
    ({ email, password }) => {
      const e = email.trim().toLowerCase();
      const acc = accounts.find((a) => a.email === e);
      if (!acc || acc.passwordHash !== pwHash(password)) return { ok: false, error: "Wrong email or password." };
      setSession(acc.id);
      return { ok: true };
    },
    [accounts, setSession],
  );

  const logOut = useCallback(() => setSession(null), [setSession]);

  const resetPassword: AuthValue["resetPassword"] = useCallback(
    ({ email, newPassword }) => {
      const e = email.trim().toLowerCase();
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
    },
    [userId, accounts, persistAccounts],
  );

  const user = accounts.find((a) => a.id === userId) ?? null;

  return (
    <Ctx.Provider value={{ hydrated, user, signUp, logIn, logOut, updateName, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
