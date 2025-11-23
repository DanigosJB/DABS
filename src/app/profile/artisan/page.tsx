"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ArtisanProfilePage() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    photoURL: "",
    bio: "",
    coopName: "",
    coopRole: "",
    memberSince: "",
    membershipId: "",
    location: "",
    email: "",
    role: "",
    sellerRating: 0,
    menteesCount: 0,
    workshopsCount: 0,
  });

  const router = useRouter();

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

        // Only artisans allowed here
        if (data.role !== "artisan") {
          router.push("/");
          return;
        }

        setForm({
          firstName: data.firstName || "Maria",
          lastName: data.lastName || "Santos",
          phone: data.phone || "",
          address: data.address || "123 Session Road, Baguio City",
          photoURL: data.photoURL || u.photoURL || "",
          bio:
            data.bio ||
            "I am a traditional weaver from Baguio, specializing in Cordillera textiles and handwoven bags.",
          coopName: data.coopName || "Cordillera Weavers",
          coopRole: data.coopRole || "Master Weaver & Mentor",
          memberSince: data.memberSince || "2023",
          membershipId: data.membershipId || "CW-2023-0142",
          location: data.location || "Baguio City",
          email: data.email || u.email || "",
          role: data.role || "artisan",
          sellerRating: data.sellerRating || 4.8,
          menteesCount: data.menteesCount || 8,
          workshopsCount: data.workshopsCount || 12,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading artisan profile", err);
        router.push("/");
      }
    });

    return () => unsub();
  }, [router]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

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
        bio: form.bio,
        coopName: form.coopName,
        coopRole: form.coopRole,
        memberSince: form.memberSince,
        membershipId: form.membershipId,
        location: form.location,
        sellerRating: form.sellerRating,
        menteesCount: form.menteesCount,
        workshopsCount: form.workshopsCount,
      });

      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      console.error("Error saving artisan profile", err);
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

  const avatarBase =
    "h-20 w-20 rounded-full flex items-center justify-center text-xl font-semibold";

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <header className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
            Artisan
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[color:var(--text-main)]">
            Seller &amp; mentor profile
          </h1>
          <p className="text-xs md:text-sm text-[color:var(--text-muted)] max-w-2xl">
            Update the information buyers see on your profile and keep your
            cooperative details and mentoring stats up to date.
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
          {/* LEFT CARD – PROFILE SUMMARY */}
          <aside className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col items-center text-center">
              {form.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoURL}
                  alt="Profile"
                  className={`${avatarBase} bg-[color:var(--bg-main)] object-cover`}
                />
              ) : (
                <div
                  className={`${avatarBase} bg-[color:var(--accent-primary)]/10 text-[color:var(--accent-primary)]`}
                >
                  {initials || "MS"}
                </div>
              )}

              <h2 className="mt-4 text-lg font-semibold text-[color:var(--text-main)]">
                {form.firstName} {form.lastName}
              </h2>

              <p className="text-xs text-[color:var(--text-muted)]">
                {form.coopRole || "Master Weaver & Mentor"}
              </p>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                <span className="rounded-full bg-[color:var(--accent-primary)] px-2.5 py-1 text-white">
                  Verified artisan
                </span>
                <span className="rounded-full bg-[color:var(--accent-teal)] px-2.5 py-1 text-white">
                  Certified mentor
                </span>
                <span className="rounded-full bg-black px-2.5 py-1 text-white">
                  Premium member
                </span>
              </div>

              {/* Basic info */}
              <div className="mt-6 w-full space-y-2 text-[0.8rem] text-[color:var(--text-main)]">
                <div className="flex items-center gap-2">
                  <span>🏛</span>
                  <span>{form.coopName || "Cordillera Weavers"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{form.location || "Baguio City"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Member since {form.memberSince || "2023"}</span>
                </div>
              </div>

              {/* STATS */}
              <div className="mt-6 w-full space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accent-primary)]/6 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Seller rating</span>
                  <span className="text-sm font-semibold">
                    {form.sellerRating || 4.8}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accent-teal)]/6 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Mentees</span>
                  <span className="text-sm font-semibold">
                    {form.menteesCount || 8}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Workshops facilitated</span>
                  <span className="text-sm font-semibold">
                    {form.workshopsCount || 12}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-xs font-medium text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)]"
                  onClick={() => {
                    const el = document.getElementById(
                      "artisan-photo-url-input"
                    ) as HTMLInputElement | null;
                    if (el) el.focus();
                  }}
                >
                  Change photo URL
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE – FORMS */}
          <section className="space-y-6 md:col-span-2">
            {/* Faux tabs (only visual for now) */}
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-4 pt-3 pb-0">
              <div className="flex gap-2 text-[0.7rem] md:text-xs">
                <button className="rounded-t-2xl bg-white px-3 py-2 text-[color:var(--text-main)] shadow-sm border-b-2 border-[color:var(--accent-primary)] font-semibold">
                  Personal info
                </button>
                <button className="rounded-t-2xl px-3 py-2 text-[color:var(--text-muted)]">
                  Artisan profile
                </button>
                <button className="rounded-t-2xl px-3 py-2 text-[color:var(--text-muted)]">
                  Mentor profile
                </button>
              </div>
            </div>

            {/* PERSONAL INFO CARD */}
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.04)] -mt-3">
              <h3 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
                Personal information
              </h3>
              <p className="mt-1 text-[0.75rem] text-[color:var(--text-muted)]">
                This information helps buyers know who is behind the craft they
                are supporting.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 text-xs md:grid-cols-2 md:text-sm">
                <div>
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    First name
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Last name
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Last name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Email address
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-main)] px-3 py-2 text-[color:var(--text-muted)]"
                    value={form.email}
                    disabled
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Phone number
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Address
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="123 Session Road, Baguio City"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    rows={3}
                    value={form.bio}
                    onChange={handleChange("bio")}
                    placeholder="Tell buyers about your craft, your story, and what inspires your work."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Profile picture URL
                  </label>
                  <input
                    id="artisan-photo-url-input"
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
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

            {/* COOPERATIVE INFO CARD */}
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
                Cooperative &amp; membership
              </h3>
              <p className="mt-1 text-[0.75rem] text-[color:var(--text-muted)]">
                These details help us highlight your involvement with local
                organizations and cooperatives.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 text-xs md:grid-cols-2 md:text-sm">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Cooperative name
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.coopName}
                    onChange={handleChange("coopName")}
                    placeholder="Cordillera Weavers"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Your role
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.coopRole}
                    onChange={handleChange("coopRole")}
                    placeholder="Master Weaver"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Member since
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.memberSince}
                    onChange={handleChange("memberSince")}
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Membership ID
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.membershipId}
                    onChange={handleChange("membershipId")}
                    placeholder="CW-2023-0142"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Location
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Baguio City"
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-[color:var(--accent-primary)] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
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
