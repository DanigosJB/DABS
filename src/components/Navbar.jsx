"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "buyer" | "artisan" | "admin" | null
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setLoadingRole(false);
        return;
      }

      try {
        setLoadingRole(true);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setRole(snap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error loading user role:", err);
        setRole(null);
      } finally {
        setLoadingRole(false);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* LEFT: Logo */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-orange-600 font-bold text-lg">DABS</span>
          <span className="text-slate-500 text-xs">
            Empowering Artisan Women
          </span>
        </Link>

        {/* CENTER NAV LINKS */}
        <nav className="flex gap-8 text-sm text-slate-700">
          <Link href="/marketplace" className="hover:text-orange-600">
            Marketplace
          </Link>
          <Link href="/workshops" className="hover:text-orange-600">
            Workshops
          </Link>
          <Link href="/mentoring" className="hover:text-orange-600">
            Mentoring
          </Link>
          <Link href="/about" className="hover:text-orange-600">
            About
          </Link>

          {/* Example: only admins see an Admin link */}
          {role === "admin" && (
            <Link href="/admin" className="hover:text-orange-600">
              Admin
            </Link>
          )}
        </nav>

        {/* RIGHT: Auth / Role / Orders */}
        <div className="flex items-center gap-6 text-sm text-slate-700">
          <Link href="/orders" className="hover:text-orange-600">
            My Orders
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-slate-600 text-sm">
                  {user.email}
                </span>
                {role && !loadingRole && (
                  <span className="text-xs text-slate-500 capitalize">
                    {role}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 font-semibold hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-orange-600">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
