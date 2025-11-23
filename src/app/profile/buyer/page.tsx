"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function BuyerProfilePage() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    photoURL: "",
    role: "",
    email: "",
    totalOrders: 0,
    wishlistCount: 0,
    deliveredCount: 0,
  });

  const router = useRouter();

  // LOAD USER + ROLE + PROFILE
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setAuthUser(u);

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          router.push("/");
          return;
        }

        const data = snap.data();

        // Only buyers can view this page
        if (data.role !== "buyer") {
          router.push("/");
          return;
        }

        setForm({
          firstName: data.firstName || "Juan",
          lastName: data.lastName || "dela Cruz",
          phone: data.phone || "",
          address:
            data.address || "456 Burnham Road, Baguio City, Benguet",
          photoURL: data.photoURL || u.photoURL || "",
          role: data.role || "buyer",
          email: data.email || u.email || "",
          totalOrders: data.totalOrders || 3,
          wishlistCount: data.wishlistCount || 2,
          deliveredCount: data.deliveredCount || 1,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading profile", err);
        router.push("/");
      }
    });

    return () => unsub();
  }, [router]);

  // HANDLE INPUT CHANGES
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // SAVE TO FIRESTORE
  const handleSave = async () => {
    if (!authUser) return;

    setSaving(true);
    setMessage(null);

    try {
      const ref = doc(db, "users", authUser.uid);
      await updateDoc(ref, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        photoURL: form.photoURL,
      });

      setMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (err) {
      console.error("Error saving profile", err);
      setMessage({
        type: "error",
        text: "Something went wrong while saving. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] flex items-center justify-center px-4">
        <p className="text-sm text-[color:var(--text-muted)]">
          Loading profile…
        </p>
      </main>
    );
  }

  const initials =
    (form.firstName?.[0] || "").toUpperCase() +
    (form.lastName?.[0] || "").toUpperCase();

  const avatarStyle =
    "h-20 w-20 rounded-full flex items-center justify-center text-xl font-semibold";

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <header className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
            Buyer
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[color:var(--text-main)]">
            My profile
          </h1>
          <p className="text-xs md:text-sm text-[color:var(--text-muted)] max-w-2xl">
            Manage your account details and shopping preferences for the DABS
            marketplace.
          </p>
        </header>

        {message && (
          <div
            className={`rounded-2xl px-4 py-2 text-xs md:text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* LEFT CARD – SUMMARY */}
          <aside className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col items-center text-center">
              {form.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoURL}
                  alt="Profile"
                  className={`${avatarStyle} bg-[color:var(--bg-main)] object-cover`}
                />
              ) : (
                <div
                  className={`${avatarStyle} bg-[color:var(--accent-primary)]/10 text-[color:var(--accent-primary)]`}
                >
                  {initials || "JD"}
                </div>
              )}

              <h2 className="mt-4 text-lg font-semibold text-[color:var(--text-main)]">
                {form.firstName} {form.lastName}
              </h2>

              <p className="text-xs text-[color:var(--text-muted)] capitalize">
                {form.role}
              </p>

              <span className="mt-2 rounded-full bg-[color:var(--accent-primary)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white">
                Member
              </span>

              {/* STATS */}
              <div className="mt-6 w-full space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accent-primary)]/6 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Total orders</span>
                  <span className="font-semibold">
                    {form.totalOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accent-teal)]/6 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Wishlist items</span>
                  <span className="font-semibold">
                    {form.wishlistCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Delivered orders</span>
                  <span className="font-semibold">
                    {form.deliveredCount || 0}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-xs font-medium text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)]"
                  onClick={() => {
                    const el = document.getElementById(
                      "profile-photo-url-input"
                    );
                    if (el) el.focus();
                  }}
                >
                  Change photo URL
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE */}
          <section className="space-y-6 md:col-span-2">
            {/* PERSONAL INFO CARD */}
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
                Personal information
              </h3>
              <p className="mt-1 text-[0.75rem] text-[color:var(--text-muted)]">
                Keep your details updated so your orders arrive at the right
                place.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 text-xs md:grid-cols-2 md:text-sm">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[color:var(--text-main)]">
                    First name
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[color:var(--text-main)]">
                    Last name
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Last name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[color:var(--text-main)]">
                    Email address
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-main)] px-3 py-2 text-[color:var(--text-muted)]"
                    value={form.email}
                    disabled
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[color:var(--text-main)]">
                    Phone number
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+63 917 123 4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[color:var(--text-main)]">
                    Delivery address
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    rows={2}
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Your delivery address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[color:var(--text-main)]">
                    Profile picture URL
                  </label>
                  <input
                    id="profile-photo-url-input"
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.photoURL}
                    onChange={handleChange("photoURL")}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="mt-1 text-[0.7rem] text-[color:var(--text-muted)]">
                    Paste a direct image URL. File uploads can be added later
                    using Firebase Storage.
                  </p>
                </div>
              </div>
            </div>

            {/* PREFERENCES CARD */}
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
                Shopping preferences
              </h3>
              <p className="mt-1 text-[0.75rem] text-[color:var(--text-muted)]">
                These tags are just visual for now – you can wire them to real
                filters in Capstone 2.
              </p>

              <p className="mt-4 text-xs font-semibold text-[color:var(--text-main)]">
                Interests
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem]">
                <span className="rounded-full bg-white px-3 py-1 text-[color:var(--text-main)] border border-[color:var(--border-soft)]">
                  Textiles
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[color:var(--text-main)] border border-[color:var(--border-soft)]">
                  Home décor
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[color:var(--text-main)] border border-[color:var(--border-soft)]">
                  Bags &amp; accessories
                </span>
              </div>

              <button
                type="button"
                className="mt-4 rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-xs font-medium text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)]"
              >
                Edit interests (coming soon)
              </button>

              <div className="mt-6 space-y-2 text-xs md:text-sm text-[color:var(--text-main)]">
                <p className="font-semibold">Newsletter</p>
                <p className="text-[color:var(--text-muted)]">
                  Get updates on new workshops, artisan stories, and featured
                  collections. (Toggle can be added in the next phase.)
                </p>
              </div>
            </div>

            {/* BECOME ARTISAN CARD */}
            <div className="rounded-3xl border border-[color:var(--accent-primary)]/30 bg-[color:var(--accent-primary)]/8 p-6">
              <h3 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
                Interested in selling?
              </h3>
              <p className="mt-2 text-xs md:text-sm text-[color:var(--text-muted)]">
                Join our community of women artisans and start listing your
                eco-friendly crafts. Access workshops, marketing tools, and
                personalized mentoring.
              </p>
              <button
                type="button"
                className="mt-4 rounded-full bg-[color:var(--accent-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
              >
                Become an artisan seller
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-[color:var(--accent-primary)] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => router.refresh?.()}
                className="rounded-full border border-[color:var(--border-soft)] bg-white px-6 py-2 text-sm font-medium text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)]"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
