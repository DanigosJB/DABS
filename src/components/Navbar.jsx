"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
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
        setRole(snap.exists() ? snap.data().role : null);
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
  };

  // Sent to correct profile folder based on role
  const getProfileRoute = () => {
    if (role === "buyer") return "/profile/buyer";
    if (role === "artisan") return "/profile/artisan";
    if (role === "admin") return "/profile/admin";
    return "/profile/buyer"; // fallback
  };

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        
        {/* LOGO */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-orange-600 font-bold text-lg">DABS</span>
          <span className="text-slate-500 text-xs">Empowering Artisan Women</span>
        </Link>

        {/* MAIN NAV */}
        <nav className="flex gap-8 text-sm text-slate-700">
          <Link href="/marketplace" className="hover:text-orange-600">Marketplace</Link>
          <Link href="/workshops" className="hover:text-orange-600">Workshops</Link>
          <Link href="/mentoring" className="hover:text-orange-600">Mentoring</Link>
          <Link href="/about" className="hover:text-orange-600">About</Link>

          {/* Only Admins see the Admin dashboard */}
          {role === "admin" && (
            <Link href="/admin" className="hover:text-orange-600">Admin</Link>
          )}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 text-sm text-slate-700">

          {/* ONLY BUYERS SEE MY ORDERS */}
          {user && role === "buyer" && (
            <Link href="/orders" className="hover:text-orange-600">
              My Orders
            </Link>
          )}

          {/* LOGGED IN */}
          {user ? (
            <div className="flex items-center gap-4">

              {/* PROFILE BUTTON */}
              <Link
                href={getProfileRoute()}
                className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 hover:border-orange-500 hover:text-orange-600"
              >
                {/* Avatar Circle */}
                <span className="inline-block h-6 w-6 rounded-full bg-slate-200" />

                {/* Email + Role */}
                <div className="flex flex-col leading-tight">
                  <span className="text-sm">{user.email}</span>
                  {!loadingRole && role && (
                    <span className="text-xs text-slate-500 capitalize">
                      {role}
                    </span>
                  )}
                </div>
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="text-red-600 font-semibold hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            /* LOGGED OUT */
            <Link href="/login" className="hover:text-orange-600">
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
