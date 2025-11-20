"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
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
      <div className="p-8">
        <p className="text-gray-800">Loading profile...</p>
      </div>
    );
  }

  const initials =
    (form.firstName?.[0] || "").toUpperCase() +
    (form.lastName?.[0] || "").toUpperCase();

  const avatarBase =
    "h-20 w-20 rounded-full flex items-center justify-center text-xl font-semibold";

  return (
    <div className="min-h-screen bg-[#f4f4fb] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">
          Admin Profile
        </h1>
        <p className="text-gray-700 mb-4">
          Manage your administrator information and platform settings overview.
        </p>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT CARD */}
          <aside className="bg-white shadow-md rounded-2xl p-6">
            <div className="flex flex-col items-center">
              {form.photoURL ? (
                <img
                  src={form.photoURL}
                  alt="Profile"
                  className={`${avatarBase} object-cover bg-gray-200`}
                />
              ) : (
                <div className={`${avatarBase} bg-indigo-100 text-indigo-700`}>
                  {initials || "AD"}
                </div>
              )}

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {form.firstName} {form.lastName}
              </h2>

              <p className="text-sm text-gray-600">
                {form.adminTitle || "Platform Administrator"}
              </p>

              <span className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-xs">
                Admin
              </span>

              <div className="mt-6 space-y-3 w-full text-sm">
                <div className="flex justify-between bg-indigo-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Total Users</span>
                  <span className="font-semibold">
                    {form.totalUsers || 0}
                  </span>
                </div>

                <div className="flex justify-between bg-indigo-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Pending Approvals</span>
                  <span className="font-semibold">
                    {form.pendingApprovals || 0}
                  </span>
                </div>

                <div className="flex justify-between bg-indigo-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Open Reports</span>
                  <span className="font-semibold">
                    {form.reportsCount || 0}
                  </span>
                </div>

                <button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 py-2 rounded-xl text-sm text-gray-800"
                  onClick={() => {
                    const el = document.getElementById(
                      "admin-photo-url-input"
                    );
                    if (el) el.focus();
                  }}
                >
                  Change Photo
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE */}
          <section className="md:col-span-2 space-y-6">
            <div className="bg-white shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block mb-1 text-gray-700">
                    First Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="First Name"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">
                    Last Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Last Name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Email Address
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700"
                    value={form.email}
                    disabled
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+63 900 000 0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Admin Title
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.adminTitle}
                    onChange={handleChange("adminTitle")}
                    placeholder="Platform Administrator"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Office Location
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.officeLocation}
                    onChange={handleChange("officeLocation")}
                    placeholder="Baguio City"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Profile Picture URL
                  </label>
                  <input
                    id="admin-photo-url-input"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.photoURL}
                    onChange={handleChange("photoURL")}
                    placeholder="https://example.com/admin-photo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a direct image URL. (File uploads will use Firebase
                    Storage later.)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Notes
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange("notes")}
                    placeholder="Internal notes about your admin responsibilities."
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => router.refresh?.()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
