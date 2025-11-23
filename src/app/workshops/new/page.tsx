"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

type Role = "buyer" | "artisan" | "admin" | null;

type Category = "Financial" | "Marketing" | "Technical";

export default function NewWorkshopPage() {
  const router = useRouter();

  // core fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Financial");
  const [mode, setMode] = useState("Online");
  const [level, setLevel] = useState("");
  const [instructor, setInstructor] = useState("");

  const [date, setDate] = useState(""); // 2025-02-20
  const [time, setTime] = useState(""); // 2:00 PM – 4:00 PM
  const [location, setLocation] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- AUTH + ROLE ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
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
          setRole((snap.data().role as Role) || null);
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

  /* ---------- SUBMIT ---------- */
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
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
        category,
        mode,
        level,
        instructor,
        date,
        time,
        location,
        shortDescription,
        description,
        capacity: numericCapacity,
        enrolled: 0,
        registrationLink,
        ownerUid: user!.uid,
        createdAt: serverTimestamp(),
      });

      router.push(`/workshops/${docRef.id}`);
    } catch (err) {
      console.error("Error saving workshop:", err);
      setError("Failed to save workshop. Please try again.");
      setSaving(false);
    }
  };

  /* ---------- UI STATES ---------- */

  if (roleLoading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <p className="text-sm text-[color:var(--text-muted)]">
          Checking permissions…
        </p>
      </main>
    );
  }

  if (!canCreate) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-6 space-y-3">
          <h1 className="text-xl font-semibold text-[color:var(--text-main)]">
            Add workshop
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            Only logged-in{" "}
            <span className="font-semibold text-[color:var(--accent-teal)]">
              artisans
            </span>{" "}
            or{" "}
            <span className="font-semibold text-[color:var(--accent-primary)]">
              admins
            </span>{" "}
            can create workshops.
          </p>
        </div>
      </main>
    );
  }

  /* ---------- FORM ---------- */

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
            Workshops
          </p>
          <h1 className="font-display text-2xl text-[color:var(--text-main)] md:text-3xl">
            Create a new session
          </h1>
          <p className="max-w-2xl text-sm text-[color:var(--text-muted)]">
            Share your expertise through financial, marketing, or technical
            sessions for artisan women and student makers.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-3xl border border-[color:var(--border-soft)] bg-white px-6 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
        >
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* TITLE */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Workshop title *
            </label>
            <input
              className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Financial Literacy Basics"
            />
          </div>

          {/* CATEGORY + MODE + LEVEL */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Track / category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
              >
                <option value="Financial">Financial</option>
                <option value="Marketing">Marketing</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Mode
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                placeholder="Online, In-person, Hybrid…"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Level
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Beginner, Intermediate…"
              />
            </div>
          </div>

          {/* INSTRUCTOR */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Facilitator / instructor
            </label>
            <input
              className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Maria Lopez, CPA"
            />
          </div>

          {/* DATE + TIME */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Date *
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Time (optional)
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="2:00 PM – 4:00 PM"
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Location *
            </label>
            <input
              className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Online via Zoom, or venue name"
            />
          </div>

          {/* SHORT DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Short description (shown on cards)
            </label>
            <input
              className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Learn the fundamentals of budgeting and saving as an artisan."
            />
          </div>

          {/* FULL DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Full description
            </label>
            <textarea
              className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what participants will learn, requirements, and any prep work."
            />
          </div>

          {/* CAPACITY + REGISTRATION LINK */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Capacity (optional)
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Registration link (optional)
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                placeholder="https://forms.gle/…"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[color:var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save workshop"}
          </button>
        </form>
      </div>
    </main>
  );
}
