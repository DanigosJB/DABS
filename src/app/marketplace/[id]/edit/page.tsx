"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type FormState = {
  title: string;
  artisanName: string;
  location: string;
  category: string;
  price: string; // keep as string for the input; convert on submit
  imageUrl: string;
  description: string;
};

export default function EditCraftPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
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

  /* -------- LOAD EXISTING CRAFT -------- */
  useEffect(() => {
    if (!id) return;

    const loadCraft = async () => {
      try {
        const ref = doc(db, "crafts", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;
          setForm({
            title: data.title || "",
            artisanName: data.artisanName || "",
            location: data.location || "",
            category: data.category || "",
            price:
              typeof data.price === "number"
                ? data.price.toString()
                : data.price || "",
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

  /* -------- HANDLERS -------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  /* -------- UI STATES -------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <p className="text-sm text-[color:var(--text-muted)]">
          Loading craft…
        </p>
      </main>
    );
  }

  // Error and no data loaded
  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <button
          onClick={() => router.push("/marketplace")}
          className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--accent-teal)] hover:underline"
        >
          ← Back to marketplace
        </button>

        <div className="max-w-xl rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-5 text-sm text-red-600">
          {error}
        </div>
      </main>
    );
  }

  /* -------- MAIN FORM -------- */

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push(`/marketplace/${id}`)}
          className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--accent-teal)] hover:underline"
        >
          ← Back to craft
        </button>

        <h1 className="text-2xl font-semibold text-[color:var(--text-main)] md:text-3xl">
          Edit craft listing
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Tweak the details of this piece so buyers see the most accurate
          story, price, and photos.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-sm"
        >
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Craft title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Handwoven Abaca Tote"
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
            />
          </div>

          {/* Artisan Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Artisan name *
            </label>
            <input
              type="text"
              name="artisanName"
              value={form.artisanName}
              onChange={handleChange}
              placeholder="Luna Loom Studio"
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Baguio City"
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Textiles, jewelry, homeware…"
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Price (₱) *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="1850"
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
            />
            <p className="text-xs text-[color:var(--text-muted)]">
              Later, we can replace this with direct uploads to Firebase
              Storage.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[color:var(--text-main)]">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell the story behind this craft, materials used, care instructions, etc."
              className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-teal)]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[color:var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
