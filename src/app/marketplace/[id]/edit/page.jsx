"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditCraftPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    artisanName: "",
    location: "",
    category: "",
    price: "",
    imageUrl: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadCraft = async () => {
      try {
        const ref = doc(db, "crafts", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            title: data.title || "",
            artisanName: data.artisanName || "",
            location: data.location || "",
            category: data.category || "",
            price: data.price?.toString() || "",
            imageUrl: data.imageUrl || "",
            description: data.description || "",
          });
        } else {
          setError("Craft not found.");
        }
      } catch (err) {
        console.error("Error loading craft:", err);
        setError("Failed to load craft.");
      } finally {
        setLoading(false);
      }
    };

    loadCraft();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.artisanName || !form.price) {
      setError("Title, artisan name, and price are required.");
      return;
    }

    const priceNumber = Number(form.price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, "crafts", id), {
        title: form.title,
        artisanName: form.artisanName,
        location: form.location || "",
        category: form.category || "",
        price: priceNumber,
        imageUrl: form.imageUrl || "",
        description: form.description || "",
      });

      router.push(`/marketplace/${id}`);
    } catch (err) {
      console.error("Error updating craft:", err);
      setError("Failed to save changes. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-700">Loading craft...</p>
      </main>
    );
  }

  if (error && !form.title) {
    // Error and no data loaded
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <button
          onClick={() => router.push("/marketplace")}
          className="mb-6 text-sm text-orange-600 hover:underline"
        >
          ← Back to Marketplace
        </button>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      <button
        onClick={() => router.push(`/marketplace/${id}`)}
        className="mb-6 text-sm text-orange-600 hover:underline"
      >
        ← Back to Craft
      </button>

      <h1 className="text-3xl font-bold mb-4 text-slate-900">
        Edit Craft
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Update the details of this craft listing.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 bg-white rounded-2xl shadow-md p-6"
      >
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Craft Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Artisan Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Artisan Name *</label>
          <input
            type="text"
            name="artisanName"
            value={form.artisanName}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Price (₱) *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
