"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
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
  const [showPassword, setShowPassword] = useState(false);

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
          router.push("/profile/buyer");
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
        router.push("/profile/buyer");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fef5ea] via-[#f8efe8] to-[#e4f3f1] overflow-hidden">
      {/* soft abstract blobs in background */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-80 w-80 rounded-full bg-[#ffcf99]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-40 h-96 w-96 rounded-full bg-[#2b9b8f]/35 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-5xl grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
          {/* LEFT: Illustration / tagline */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center rounded-full bg-white/70 px-4 py-1 text-xs font-medium text-teal-800 shadow-sm border border-teal-100">
              <span className="mr-2 text-[10px]">●</span>
              Powered by artisan women of the Cordillera
            </div>

            <h1 className="mt-6 text-3xl font-semibold text-slate-900 leading-snug">
              Log in to{" "}
              <span className="underline decoration-[color:var(--accent-primary,#f4a261)] decoration-[0.28em] underline-offset-[0.18em]">
                continue your craft journey
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm text-slate-600">
              Manage your marketplace activity, join workshops, and connect
              with mentors—all in one place designed for artisan-led
              businesses.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-white/80 border border-orange-100 px-4 py-3 shadow-sm">
                <p className="font-semibold text-slate-900 mb-1">
                  For artisans
                </p>
                <p className="text-slate-600">
                  Publish new listings, track orders, and manage mentoring
                  sessions.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-teal-100 px-4 py-3 shadow-sm">
                <p className="font-semibold text-slate-900 mb-1">
                  For buyers
                </p>
                <p className="text-slate-600">
                  Save favorites, follow your orders, and discover new crafts.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Login card */}
          <div className="w-full">
            <div className="w-full max-w-md ml-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.08)] border border-[#f3e3cf] px-8 py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Welcome back
              </h2>
              <p className="text-xs text-gray-600 mb-6">
                Log in to access the DABS marketplace and dashboard.
              </p>

              {error && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs border border-red-100">
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
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-9 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {/* eye icon */}
                      {showPassword ? (
                        // eye-off
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 0-1.54.4-2.98 1.1-4.24" />
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58A3 3 0 0 0 13.42 13.4" />
                          <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.26 11.26 0 0 1-2.16 3.19" />
                        </svg>
                      ) : (
                        // eye
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
                >
                  {submitting && (
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  )}
                  {submitting ? "Logging in..." : "Log In"}
                </button>
              </form>

              {/* Register options */}
              <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-gray-600">
                <p className="mb-2">Don&apos;t have an account yet?</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/register?role=buyer"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50"
                  >
                    Register as Buyer
                  </Link>
                  <Link
                    href="/register?role=artisan"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-full border border-orange-500 text-orange-600 bg-orange-50/60 hover:bg-orange-50"
                  >
                    Register as Artisan
                  </Link>
                </div>
                <p className="mt-3 text-[11px] text-gray-500">
                  Admins use the same login form. Admin privileges are
                  assigned by the system maintainer and cannot be
                  self-registered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
