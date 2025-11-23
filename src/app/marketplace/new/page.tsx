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

export default function NewCraftPage() {
  const router = useRouter();

  // form fields
  const [title, setTitle] = useState("");
  const [artisanName, setArtisanName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // auth + role
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null); // buyer | artisan | admin | null
  const [roleLoading, setRoleLoading] = useState(true);

  // ui state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- AUTH + ROLE ---------------- */
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
          setRole((snap.data().role as Role) || null); // expect "artisan" or "admin"
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

  /* ---------------- SUBMIT ---------------- */
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!canCreate) {
      setError("You are not allowed to add crafts.");
      return;
    }

    if (!title || !artisanName || !location || !category || !price) {
      setError("Please fill in all required fields.");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);

      const docRef = await addDoc(collection(db, "crafts"), {
        title,
        artisanName,
        location,
        category,
        price: numericPrice,
        imageUrl: imageUrl || "",
        description: description || "",
        ownerUid: user!.uid, // safe because canCreate ensures user is truthy
        createdAt: serverTimestamp(),
      });

      router.push(`/marketplace/${docRef.id}`);
    } catch (err) {
      console.error("Error saving craft:", err);
      setError("Failed to save craft. Please try again.");
      setSaving(false);
    }
  };

  /* ---------------- UI STATES ---------------- */

  if (roleLoading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)]/80 px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Checking permissions...
        </div>
      </main>
    );
  }

  if (!canCreate) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8">
          <h1 className="text-xl font-semibold text-[color:var(--text-main)] md:text-2xl">
            Add New Craft
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
            can add crafts to the marketplace.
          </p>
        </div>
      </main>
    );
  }

  /* ---------------- FORM ---------------- */

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-start">
        {/* Left: form */}
        <section className="flex-1">
          <header className="mb-6 space-y-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
              Marketplace · New listing
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text-main)] md:text-3xl">
              Add a new craft
            </h1>
            <p className="text-sm text-[color:var(--text-muted)]">
              Share your work with buyers looking for locally made, small-batch
              pieces.
            </p>
          </header>

          <form
            onSubmit={handleSave}
            className="space-y-4 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_36px_rgba(0,0,0,0.08)]"
          >
            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* TITLE */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Craft title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cordillera weaving shawl"
              />
            </div>

            {/* ARTISAN NAME */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Artisan name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                value={artisanName}
                onChange={(e) => setArtisanName(e.target.value)}
                placeholder="Aling Maria"
              />
            </div>

            {/* LOCATION */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Baguio City"
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Weaving, jewelry, homeware, accessories…"
              />
            </div>

            {/* PRICE */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Price (₱) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
              />
            </div>

            {/* IMAGE URL */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Image URL
              </label>
              <input
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/craft.jpg"
              />
              <p className="text-xs text-[color:var(--text-muted)]">
                Later, we can replace this with direct image uploads to Firebase
                Storage.
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[color:var(--text-main)]">
                Description
              </label>
              <textarea
                className="w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the story behind this craft, materials used, care instructions, etc."
              />
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[color:var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save craft"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="rounded-full border border-[color:var(--border-soft)] bg-white px-5 py-2.5 text-sm font-medium text-[color:var(--accent-teal)] hover:bg-[color:var(--accent-teal)] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>

        {/* Right: helper panel */}
        <aside className="md:w-72">
          <div className="space-y-3 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-5 text-sm">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-primary)]">
              Listing tips
            </p>
            <p className="text-[color:var(--text-muted)]">
              Clear titles and photos help buyers quickly understand what makes
              your craft special.
            </p>
            <ul className="space-y-1.5 text-[0.8rem] text-[color:var(--text-muted)]">
              <li>• Mention materials and techniques used.</li>
              <li>• Share where the craft was made.</li>
              <li>• Add care instructions if needed.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
