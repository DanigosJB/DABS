"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NewWorkshopPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");        // e.g. 2025-02-20
  const [time, setTime] = useState("");        // e.g. 2:00 PM
  const [location, setLocation] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auth + role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setRole(snap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error loading role:", err);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const canCreate =
    !roleLoading && user && (role === "artisan" || role === "admin");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!canCreate) {
      setError("You are not allowed to add workshops.");
      return;
    }

    if (!title || !date || !location) {
      setError("Please fill in at least Title, Date, and Location.");
      return;
    }

    const numericCapacity = capacity ? Number(capacity) : null;
    if (capacity && (Number.isNaN(numericCapacity) || numericCapacity <= 0)) {
      setError("Capacity must be a positive number.");
      return;
    }

    try {
      setSaving(true);

      const docRef = await addDoc(collection(db, "workshops"), {
        title,
        date,
        time,
        location,
        shortDescription,
        description,
        capacity: numericCapacity,
        registrationLink,
        ownerUid: user.uid,      // who created this workshop
        createdAt: serverTimestamp(),
      });

      router.push(`/workshops/${docRef.id}`);
    } catch (err) {
      console.error("Error saving workshop:", err);
      setError("Failed to save workshop. Please try again.");
      setSaving(false);
    }
  };

  if (roleLoading) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-600">Checking permissions...</p>
      </main>
    );
  }

  if (!canCreate) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Add Workshop
        </h1>
        <p className="text-slate-600">
          Only logged-in <span className="font-semibold">artisans</span> or{" "}
          <span className="font-semibold">admins</span> can create workshops.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Add Workshop</h1>
      <p className="text-sm text-slate-600 mb-6">
        Create a new training session or learning circle for artisan women.
      </p>

      <form
        onSubmit={handleSave}
        className="max-w-xl bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* TITLE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Workshop Title *
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Intro to Cordillera Weaving"
          />
        </div>

        {/* DATE + TIME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Date *
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Time (optional)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="2:00 PM – 4:00 PM"
            />
          </div>
        </div>

        {/* LOCATION */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Location *
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Baguio City, Community Center"
          />
        </div>

        {/* SHORT DESCRIPTION */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Short Description (shown on cards)
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Basics of loom weaving and design patterns."
          />
        </div>

        {/* FULL DESCRIPTION */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Full Description
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what participants will learn, required materials, who the facilitator is, etc."
          />
        </div>

        {/* CAPACITY + REG LINK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Capacity (optional)
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Registration Link (optional)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={registrationLink}
              onChange={(e) => setRegistrationLink(e.target.value)}
              placeholder="https://forms.gle/..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Workshop"}
        </button>
      </form>
    </main>
  );
}
