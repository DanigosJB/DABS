"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
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

  // If already logged in, send them away
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const existingRole = snap.exists() ? snap.data().role : null;

        if (existingRole === "admin") {
          router.push("/admin");
        } else if (existingRole === "artisan") {
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
        role: fixedRole, // fixed as buyer or artisan
        createdAt: serverTimestamp(),
      });

      if (fixedRole === "artisan") {
        router.push("/profile/artisan");
      } else {
        router.push("/profile/buyer");
      }
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
      ? "Register to list your crafts and manage your DABS marketplace profile."
      : "Register to shop from women artisans and manage your buyer profile.";

  return (
    <div className="min-h-screen bg-[#fdf4e6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {/* Small badge showing what type of account */}
        <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
          Registering as:{" "}
          <span className="ml-1 capitalize">{fixedRole}</span>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-100 text-red-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

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

          <div>
            <label className="block mb-1 text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Already have an account?{" "}
          <span
            className="text-orange-600 font-semibold cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
