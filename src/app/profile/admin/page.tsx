"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function AdminProfilePage() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    photoURL: "",
    email: "",
    role: "",
    adminTitle: "",
    officeLocation: "",
    notes: "",
    totalUsers: 0,
    pendingApprovals: 0,
    reportsCount: 0,
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

        // Only admins allowed
        if (data.role !== "admin") {
          router.push("/");
          return;
        }

        setForm({
          firstName: data.firstName || "Admin",
          lastName: data.lastName || "User",
          phone: data.phone || "",
          photoURL: data.photoURL || u.photoURL || "",
          email: data.email || u.email || "",
          role: data.role || "admin",
          adminTitle: data.adminTitle || "Platform Administrator",
          officeLocation: data.officeLocation || "Baguio City",
          notes:
            data.notes ||
            "Oversees marketplace operations, user safety, and platform growth.",
          totalUsers: data.totalUsers || 1200,
          pendingApprovals: data.pendingApprovals || 6,
          reportsCount: data.reportsCount || 3,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading admin profile", err);
        router.push("/");
      }
    });

    return () => unsub();
  }, [router]);

  const handleChange = (field) => (e) => {
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
        photoURL: form.photoURL,
        adminTitle: form.adminTitle,
        officeLocation: form.officeLocation,
        notes: form.notes,
      });

      setMessage({
        type: "success",
        text: "Admin profile updated successfully.",
      });
    } catch (err) {
      console.error("Error saving admin profile", err);
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
      <div className="min-h-screen bg-[color:var(--bg-main)] flex items-center justify-center px-4">
        <p className="text-sm text-[color:var(--text-muted)]">
          Loading profile…
        </p>
      </div>
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
            Admin
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[color:var(--text-main)]">
            Admin profile & settings
          </h1>
          <p className="text-xs md:text-sm text-[color:var(--text-muted)] max-w-2xl">
            Update your administrator information and keep a quick overview of
            platform activity and responsibilities.
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
                  alt="Admin profile"
                  className={`${avatarBase} bg-[color:var(--bg-main)] object-cover`}
                />
              ) : (
                <div
                  className={`${avatarBase} bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]`}
                >
                  {initials || "AD"}
                </div>
              )}

              <h2 className="mt-4 text-lg font-semibold text-[color:var(--text-main)]">
                {form.firstName} {form.lastName}
              </h2>
              <p className="text-xs text-[color:var(--text-muted)]">
                {form.adminTitle || "Platform Administrator"}
              </p>

              <span className="mt-3 rounded-full bg-[color:var(--accent-primary)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
                Admin
              </span>

              {form.officeLocation && (
                <p className="mt-3 text-[0.75rem] text-[color:var(--text-muted)]">
                  Based in{" "}
                  <span className="font-medium text-[color:var(--text-main)]">
                    {form.officeLocation}
                  </span>
                </p>
              )}

              {/* QUICK STATS */}
              <div className="mt-6 w-full space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accent-teal)]/5 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Total users</span>
                  <span className="text-sm font-semibold">
                    {form.totalUsers || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accent-primary)]/5 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Pending approvals</span>
                  <span className="text-sm font-semibold">
                    {form.pendingApprovals || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-[color:var(--text-main)]">
                  <span>Open reports</span>
                  <span className="text-sm font-semibold">
                    {form.reportsCount || 0}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-xs font-medium text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)]"
                  onClick={() => {
                    const el = document.getElementById(
                      "admin-photo-url-input"
                    ) as HTMLInputElement | null;
                    if (el) el.focus();
                  }}
                >
                  Change photo URL
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE – FORM */}
          <section className="space-y-6 md:col-span-2">
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
                Personal information
              </h3>
              <p className="mt-1 text-[0.75rem] text-[color:var(--text-muted)]">
                This information is only visible inside the admin dashboard and
                not to buyers or artisans.
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
                    placeholder="+63 900 000 0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Admin title
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.adminTitle}
                    onChange={handleChange("adminTitle")}
                    placeholder="Platform Administrator"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Office location
                  </label>
                  <input
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.officeLocation}
                    onChange={handleChange("officeLocation")}
                    placeholder="Baguio City"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Profile picture URL
                  </label>
                  <input
                    id="admin-photo-url-input"
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    value={form.photoURL}
                    onChange={handleChange("photoURL")}
                    placeholder="https://example.com/admin-photo.jpg"
                  />
                  <p className="mt-1 text-[0.7rem] text-[color:var(--text-muted)]">
                    Paste a direct image URL. File uploads can be added later
                    using Firebase Storage.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[color:var(--text-main)] text-xs font-medium">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/40"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange("notes")}
                    placeholder="Internal notes about your admin responsibilities."
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
