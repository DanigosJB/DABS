"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("artisan"); // default: artisan
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // 1) Create Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Create Firestore user profile with role
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role, // "buyer" | "artisan" | "admin" (for admin you’ll set manually)
        createdAt: serverTimestamp(),
      });

      // 3) Go to marketplace (or wherever you want)
      router.push("/marketplace");
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Failed to register. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      <h1 className="text-3xl font-bold mb-4 text-slate-900">
        Create Artisan Account
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Register to list your crafts and manage your DABS marketplace profile.
      </p>

      <form
        onSubmit={handleRegister}
        className="max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="artisan@example.com"
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="At least 6 characters"
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* ROLE SELECTOR */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Account Type
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="artisan">Artisan (sell crafts)</option>
            <option value="buyer">Buyer (shop only)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-orange-600 font-semibold hover:underline"
        >
          Log in
        </button>
      </p>
    </main>
  );
}
