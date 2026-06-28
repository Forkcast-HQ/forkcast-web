"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { useAuth } from "@/lib/auth";
import { cls } from "@/lib/format";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-restaurants", label: "For restaurants" },
  { href: "/business", label: "The opportunity" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    setMenu(false);
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cls(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === l.href ? "bg-brand-50 text-brand-700" : "text-ink/70 hover:bg-black/5 hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {hydrated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-2.5 transition hover:border-black/20"
              >
                <Avatar name={user.name} email={user.email} size={30} />
                <span className="max-w-[120px] truncate text-sm font-semibold text-ink">
                  {user.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className={cls("h-4 w-4 text-ink/40 transition", menu && "rotate-180")} />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white card-shadow-lg">
                  <div className="border-b border-black/5 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.name || "Your account"}</p>
                    <p className="truncate text-xs text-ink/50">{user.email}</p>
                  </div>
                  <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
                  <MenuLink href="/profile" icon={<User className="h-4 w-4" />}>Profile &amp; settings</MenuLink>
                  <button
                    onClick={() => {
                      logOut();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-white/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">
                {l.label}
              </Link>
            ))}
            {hydrated && user ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">Dashboard</Link>
                <Link href="/profile" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">Profile &amp; settings</Link>
                <button onClick={() => { logOut(); router.push("/"); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">Log in</Link>
                <Link href="/signup" className="mt-1 rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-black/5">
      {icon}
      {children}
    </Link>
  );
}
