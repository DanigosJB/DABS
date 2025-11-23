"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Role = "buyer" | "artisan" | "admin" | null;

type NavLinkItem = {
  href: string;
  label: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loadingRole, setLoadingRole] = useState<boolean>(true);
  const [navOpen, setNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setLoadingRole(false);
        return;
      }

      try {
        setLoadingRole(true);
        const snap = await getDoc(doc(db, "users", u.uid));
        setRole(snap.exists() ? (snap.data().role as Role) : null);
      } catch (err) {
        console.error("Error loading user role:", err);
      } finally {
        setLoadingRole(false);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setNavOpen(false);
  };

  const getProfileRoute = () => {
    if (role === "buyer") return "/profile/buyer";
    if (role === "artisan") return "/profile/artisan";
    if (role === "admin") return "/profile/admin";
    return "/profile/buyer";
  };

  const closeMenu = () => setNavOpen(false);

  const links: NavLinkItem[] = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/workshops", label: "Workshops" },
    { href: "/mentoring", label: "Mentoring" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border-soft)] bg-[color:var(--bg-main)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={closeMenu}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md">
            <span className="text-sm font-semibold text-[color:var(--accent-teal)]">
              D
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[0.7rem] font-semibold tracking-[0.26em] text-[color:var(--accent-teal)] uppercase">
              DABS MARKETPLACE
            </span>
            <span className="text-[0.7rem] text-[color:var(--text-muted)]">
              Empowering artisan women
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[color:var(--text-muted)] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative pb-1 transition-colors hover:text-[color:var(--accent-teal)]"
            >
              <span>{link.label}</span>
              <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-[color:var(--accent-primary)] transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}

          {role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full border border-[color:var(--border-soft)] bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-secondary)] hover:bg-[color:var(--accent-primary)] hover:text-white"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* RIGHT SIDE – DESKTOP */}
        <div className="hidden items-center gap-4 text-xs md:flex">
          {user && role === "buyer" && (
            <Link
              href="/orders"
              className="text-[0.7rem] font-medium tracking-[0.16em] text-[color:var(--accent-teal)] hover:text-[color:var(--accent-secondary)] uppercase"
            >
              My Orders
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {/* PROFILE CHIP */}
              <Link
                href={getProfileRoute()}
                className="flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white/90 px-3 py-1.5 text-[color:var(--text-main)] shadow-sm hover:border-[color:var(--accent-primary)]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--accent-teal)] text-[0.7rem] font-semibold uppercase text-white">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[0.75rem]">
                    {user?.email?.split("@")[0]}
                  </span>
                  {!loadingRole && role && (
                    <span className="text-[0.65rem] capitalize text-[color:var(--text-muted)]">
                      {role}
                    </span>
                  )}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-secondary)] hover:text-[color:var(--accent-primary)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-teal)] hover:text-[color:var(--accent-secondary)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[color:var(--accent-primary)] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white shadow hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-white/90 p-2 shadow border border-[color:var(--border-soft)] md:hidden"
          onClick={() => setNavOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <div className="flex flex-col gap-[3px]">
            <span
              className={`h-[2px] w-4 rounded-full bg-[color:var(--accent-teal)] transition ${
                navOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-4 rounded-full bg-[color:var(--accent-teal)] transition ${
                navOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[2px] w-4 rounded-full bg-[color:var(--accent-teal)] transition ${
                navOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {navOpen && (
        <div className="border-t border-[color:var(--border-soft)] bg-[color:var(--bg-card)] md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm text-[color:var(--text-main)]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between py-1"
              >
                <span>{link.label}</span>
              </Link>
            ))}

            {role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="mt-1 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--bg-main)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Admin Dashboard
              </Link>
            )}

            {user && role === "buyer" && (
              <Link
                href="/orders"
                onClick={closeMenu}
                className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--accent-teal)]"
              >
                My Orders
              </Link>
            )}

            <div className="mt-3 border-t border-[color:var(--border-soft)] pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-teal)] text-xs font-semibold uppercase text-white">
                      {user?.email?.charAt(0).toUpperCase() ?? "U"}
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm">
                        {user?.email?.split("@")[0]}
                      </span>
                      {!loadingRole && role && (
                        <span className="text-[0.7rem] capitalize text-[color:var(--text-muted)]">
                          {role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link
                      href={getProfileRoute()}
                      onClick={closeMenu}
                      className="flex-1 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--bg-main)] px-3 py-1.5 text-center text-xs font-medium"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 rounded-full bg-[color:var(--accent-secondary)] px-3 py-1.5 text-center text-xs font-semibold text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block rounded-full bg-[color:var(--accent-teal)] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text:white text-white"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
