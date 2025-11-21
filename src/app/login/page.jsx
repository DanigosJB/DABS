"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, send user where they belong
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role === "admin") {
          router.push("/admin");
        } else if (role === "artisan") {
          router.push("/profile/artisan");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error checking role:", err);
      }
    });

    return () => unsub();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const u = cred.user;
      const snap = await getDoc(doc(db, "users", u.uid));
      const role = snap.exists() ? snap.data().role : null;

      if (role === "admin") {
        router.push("/admin");
      } else if (role === "artisan") {
        router.push("/profile/artisan");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf4e6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Log in to access the DABS marketplace and dashboard.
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-100 text-red-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Register options */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-gray-600">
          <p className="mb-2">Don&apos;t have an account yet?</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/register?role=buyer"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50"
            >
              Register as Buyer
            </Link>
            <Link
              href="/register?role=artisan"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-full border border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              Register as Artisan
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-gray-500">
            Admins use the same login form. Admin privileges are assigned by the
            system maintainer and cannot be self-registered.
          </p>
        </div>
      </div>
    </div>
  );
}
