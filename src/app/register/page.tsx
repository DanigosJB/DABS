"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Decide role based on query (?role=buyer or ?role=artisan)
  const urlRole = (searchParams.get("role") || "buyer").toLowerCase();
  const fixedRole = urlRole === "artisan" ? "artisan" : "buyer";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role === "admin") router.push("/admin");
        else if (role === "artisan") router.push("/profile/artisan");
        else router.push("/profile/buyer");
      } catch (err) {
        console.error("Role check error:", err);
      }
    });

    return () => unsub();
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const u = cred.user;

      await setDoc(doc(db, "users", u.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: u.email,
        role: fixedRole,
        createdAt: serverTimestamp(),
      });

      if (fixedRole === "artisan") router.push("/profile/artisan");
      else router.push("/profile/buyer");
    } catch (err) {
      console.error("Register error:", err);
      setError("Unable to create account. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    fixedRole === "artisan" ? "Create Artisan Account" : "Create Buyer Account";

  const description =
    fixedRole === "artisan"
      ? "Join DABS as an artisan to sell your handmade crafts and manage your business profile."
      : "Create a buyer account to shop from women artisans across the Cordillera region.";

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[color:var(--border-soft)] p-8">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
            Register
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[color:var(--text-main)] mt-1">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-[color:var(--text-muted)] mt-2">
            {description}
          </p>

          {/* Role Badge */}
          <div className="mt-4 inline-flex items-center rounded-full bg-[color:var(--accent-primary)]/10 text-[color:var(--accent-primary)] px-3 py-[6px] text-[11px] font-medium">
            Registering as:{" "}
            <span className="ml-1 font-semibold capitalize">{fixedRole}</span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[color:var(--text-main)] text-xs font-medium">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[color:var(--border-soft)]
                bg-white px-3 py-2 text-[color:var(--text-main)]
                focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
              />
            </div>

            <div className="flex-1">
              <label className="text-[color:var(--text-main)] text-xs font-medium">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[color:var(--border-soft)]
                bg-white px-3 py-2 text-[color:var(--text-main)]
                focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-[color:var(--text-main)] text-xs font-medium">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[color:var(--border-soft)]
              bg-white px-3 py-2 text-[color:var(--text-main)]
              focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
            />
          </div>

          <div>
            <label className="text-[color:var(--text-main)] text-xs font-medium">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[color:var(--border-soft)]
              bg-white px-3 py-2 text-[color:var(--text-main)]
              focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
            />
          </div>

          <div>
            <label className="text-[color:var(--text-main)] text-xs font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[color:var(--border-soft)]
              bg-white px-3 py-2 text-[color:var(--text-main)]
              focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[color:var(--accent-primary)]
            py-2 text-sm font-semibold text-white shadow-md
            hover:brightness-95 transition disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* LINK TO LOGIN */}
        <p className="mt-6 text-center text-[11px] text-[color:var(--text-muted)]">
          Already have an account?{" "}
          <span
            className="text-[color:var(--accent-primary)] font-medium cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in instead
          </span>
        </p>
      </div>
    </main>
  );
}
