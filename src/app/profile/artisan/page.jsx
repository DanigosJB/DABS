"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
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
    <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">
          Seller &amp; Mentor Profile
        </h1>
        <p className="text-gray-700 mb-4">
          Manage your artisan and mentor profile information
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
                <div className={`${avatarBase} bg-orange-100 text-orange-700`}>
                  {initials || "MS"}
                </div>
              )}

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {form.firstName} {form.lastName}
              </h2>

              <p className="text-sm text-gray-600">
                {form.coopRole || "Master Weaver & Mentor"}
              </p>

              <div className="flex flex-wrap gap-2 justify-center mt-3 text-[10px]">
                <span className="px-2 py-1 bg-orange-500 text-white rounded-full">
                  Verified Artisan
                </span>
                <span className="px-2 py-1 bg-blue-500 text-white rounded-full">
                  Certified Mentor
                </span>
                <span className="px-2 py-1 bg-gray-800 text-white rounded-full">
                  Premium Member
                </span>
              </div>

              <div className="mt-6 w-full text-xs text-gray-700 space-y-2">
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

              <div className="mt-6 space-y-3 w-full text-sm">
                <div className="flex justify-between bg-orange-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Seller Rating</span>
                  <span className="font-semibold">
                    {form.sellerRating || 4.8}
                  </span>
                </div>

                <div className="flex justify-between bg-orange-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Mentees</span>
                  <span className="font-semibold">
                    {form.menteesCount || 8}
                  </span>
                </div>

                <div className="flex justify-between bg-orange-50 px-4 py-3 rounded-xl text-gray-800">
                  <span>Workshops</span>
                  <span className="font-semibold">
                    {form.workshopsCount || 12}
                  </span>
                </div>

                <button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 py-2 rounded-xl text-sm text-gray-800"
                  onClick={() => {
                    const el = document.getElementById(
                      "artisan-photo-url-input"
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
            {/* TABS (visual only) */}
            <div className="bg-white rounded-2xl px-6 pt-4 pb-0">
              <div className="flex gap-2 text-xs md:text-sm">
                <button className="px-3 py-2 rounded-t-lg bg-white border-b-2 border-orange-500 font-medium text-gray-900">
                  Personal Info
                </button>
                <button className="px-3 py-2 rounded-t-lg text-gray-500">
                  Artisan Profile
                </button>
                <button className="px-3 py-2 rounded-t-lg text-gray-500">
                  Mentor Profile
                </button>
              </div>
            </div>

            {/* PERSONAL INFO */}
            <div className="bg-white shadow-md rounded-2xl p-6 -mt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block mb-1 text-gray-700">
                    First Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">Address</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.address}
                    onChange={handleChange("address")}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">Bio</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    rows={3}
                    value={form.bio}
                    onChange={handleChange("bio")}
                    placeholder="Tell buyers about your craft and story."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Profile Picture URL
                  </label>
                  <input
                    id="artisan-photo-url-input"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.photoURL}
                    onChange={handleChange("photoURL")}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a direct image URL. (File uploads will use Firebase
                    Storage later.)
                  </p>
                </div>
              </div>
            </div>

            {/* COOPERATIVE INFO */}
            <div className="bg-white shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Cooperative Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-gray-700">
                    Cooperative Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.coopName}
                    onChange={handleChange("coopName")}
                    placeholder="Cordillera Weavers"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">Your Role</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.coopRole}
                    onChange={handleChange("coopRole")}
                    placeholder="Master Weaver"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">
                    Member Since
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.memberSince}
                    onChange={handleChange("memberSince")}
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">
                    Membership ID
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.membershipId}
                    onChange={handleChange("membershipId")}
                    placeholder="CW-2023-0142"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">Location</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Baguio City"
                  />
                </div>
              </div>
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
