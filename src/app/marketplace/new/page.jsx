"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NewCraftPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [artisanName, setArtisanName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);          // buyer | artisan | admin
  const [roleLoading, setRoleLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- AUTH + ROLE ---------------- */
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
          setRole(snap.data().role || null);       // expect "artisan" or "admin"
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
  const handleSave = async (e) => {
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
        ownerUid: user.uid,           // 🔑 who owns this craft
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
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-600">Checking permissions...</p>
      </main>
    );
  }

  if (!canCreate) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Add New Craft
        </h1>
        <p className="text-slate-600">
          Only logged-in <span className="font-semibold">artisans</span> or{" "}
          <span className="font-semibold">admins</span> can add crafts.
        </p>
      </main>
    );
  }

  /* ---------------- FORM ---------------- */

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Add New Craft</h1>
      <p className="text-sm text-slate-600 mb-6">
        Fill out the details below to list a new craft in the DABS marketplace.
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
            Craft Title *
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cordillera Weaving Shawl"
          />
        </div>

        {/* ARTISAN NAME */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Artisan Name *
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={artisanName}
            onChange={(e) => setArtisanName(e.target.value)}
            placeholder="Aling Maria"
          />
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
            placeholder="Baguio City"
          />
        </div>

        {/* CATEGORY */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Category *
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Weaving, Woodcraft, etc."
          />
        </div>

        {/* PRICE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Price (₱) *
          </label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1500"
          />
        </div>

        {/* IMAGE URL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Image URL
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-slate-500">
            Later we can replace this with direct image upload to Firebase
            Storage.
          </p>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell the story behind this craft, materials used, care instructions, etc."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Craft"}
        </button>
      </form>
    </main>
  );
}
