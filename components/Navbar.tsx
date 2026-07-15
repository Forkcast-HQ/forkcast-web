"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LayoutDashboard, User, LogOut, ChevronDown, ShoppingBag, ReceiptText } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { useAuth } from "@/lib/auth";
import { useOrder } from "@/lib/order";
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
  const { cartCount } = useOrder();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setMenu(false);
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href === "/discover" && pathname.startsWith("/restaurant/"));

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-cream/85 shadow-[0_8px_30px_-24px_rgba(32,22,15,0.45)] backdrop-blur-xl">
      <nav aria-label="Primary navigation" className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 rounded-xl" aria-label="Forkcast home">
            <Logo />
          </Link>
          <span className="hidden rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 lg:inline-flex">
            Boston pilot
          </span>
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-black/[0.06] bg-white/75 p-1 shadow-sm md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cls(
                "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                isActive(l.href) ? "bg-brand-950 text-white shadow-sm" : "text-ink/65 hover:bg-black/5 hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {hydrated && user && (
            <Link
              href="/basket"
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink/70 transition hover:bg-black/5 hover:text-ink"
              aria-label="Basket"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {hydrated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:border-brand-300"
              >
                <Avatar name={user.name} email={user.email} size={30} />
                <span className="max-w-[120px] truncate text-sm font-semibold text-ink">
                  {user.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className={cls("h-4 w-4 text-ink/40 transition", menu && "rotate-180")} />
              </button>
              {menu && (
                <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white card-shadow-lg">
                  <div className="border-b border-black/5 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.name || "Your account"}</p>
                    <p className="truncate text-xs text-ink/50">{user.email}</p>
                  </div>
                  <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
                  <MenuLink href="/orders" icon={<ReceiptText className="h-4 w-4" />}>Orders</MenuLink>
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
                className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/15 transition hover:-translate-y-0.5 hover:bg-brand-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-xl border border-black/[0.06] bg-white/80 text-ink shadow-sm md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-navigation" className="border-t border-black/5 bg-cream/95 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cls(
                  "rounded-xl px-3 py-3 text-sm font-semibold",
                  isActive(l.href) ? "bg-brand-950 text-white" : "text-ink/75 hover:bg-black/5",
                )}
              >
                {l.label}
              </Link>
            ))}
            {hydrated && user ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">Dashboard</Link>
                <Link href="/basket" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">Basket{cartCount > 0 ? ` (${cartCount})` : ""}</Link>
                <Link href="/orders" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5">Orders</Link>
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
