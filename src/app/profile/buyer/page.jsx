"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
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
      <div className="p-8">
        <p className="text-gray-800">Loading profile...</p>
      </div>
    );
  }

  const initials =
    (form.firstName?.[0] || "").toUpperCase() +
    (form.lastName?.[0] || "").toUpperCase();

  const avatarStyle =
    "h-20 w-20 rounded-full flex items-center justify-center text-xl font-semibold";

  return (
    <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">
          My Profile
        </h1>
        <p className="text-gray-700 mb-4">
          Manage your account information and preferences
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
                  className={`${avatarStyle} object-cover bg-gray-200`}
                />
              ) : (
                <div className={`${avatarStyle} bg-orange-100 text-orange-700`}>
                  {initials || "JD"}
                </div>
              )}

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {form.firstName} {form.lastName}
              </h2>

              <p className="text-sm text-gray-600 capitalize">
                {form.role}
              </p>

              <span className="mt-2 px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
                Member
              </span>

              <div className="mt-6 space-y-3 w-full text-sm">
                <div className="flex justify-between bg-orange-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Total Orders</span>
                  <span className="font-semibold">
                    {form.totalOrders}
                  </span>
                </div>

                <div className="flex justify-between bg-orange-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Wishlist Items</span>
                  <span className="font-semibold">
                    {form.wishlistCount}
                  </span>
                </div>

                <div className="flex justify-between bg-orange-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Delivered</span>
                  <span className="font-semibold">
                    {form.deliveredCount}
                  </span>
                </div>

                <button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 py-2 rounded-xl text-sm text-gray-800"
                  onClick={() => {
                    // Just focus the profile URL field
                    const el = document.getElementById(
                      "profile-photo-url-input"
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
            {/* PERSONAL INFO */}
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+63 917 123 4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Delivery Address
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    rows={2}
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Your delivery address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Profile Picture URL
                  </label>
                  <input
                    id="profile-photo-url-input"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.photoURL}
                    onChange={handleChange("photoURL")}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a direct image URL. (Uploading files will need
                    Firebase Storage later.)
                  </p>
                </div>
              </div>
            </div>

            {/* PREFERENCES */}
            <div className="bg-white shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Preferences
              </h3>

              <p className="text-sm text-gray-700 mb-2">
                Shopping Interests
              </p>

              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-800">
                  Textiles
                </span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-800">
                  Home Decor
                </span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-800">
                  Bags &amp; Accessories
                </span>
              </div>

              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 hover:bg-gray-50">
                Edit Interests
              </button>

              <div className="mt-6">
                <p className="text-sm text-gray-700 mb-2">
                  Newsletter Subscription
                </p>
                <p className="text-sm text-gray-600">
                  Send me updates about new products and workshops.
                </p>
              </div>
            </div>

            {/* BECOME ARTISAN CARD */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Interested in Selling?
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Join our community of women artisans and start selling your
                eco-friendly crafts. Get access to digital marketing tools,
                workshops, and more.
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                Become an Artisan Seller
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
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
