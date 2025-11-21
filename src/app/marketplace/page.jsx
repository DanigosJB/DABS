"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function MarketplacePage() {
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Load logged-in user + role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error loading user role:", err);
      }
    });

    return () => unsub();
  }, []);

  // Load crafts
  useEffect(() => {
    const loadCrafts = async () => {
      try {
        const ref = collection(db, "crafts");
        const snap = await getDocs(ref);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCrafts(list);
      } catch (err) {
        console.error("Error loading crafts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCrafts();
  }, []);

  const normalizeText = (str) =>
    (str || "").toString().toLowerCase().trim();

  // UPDATED SEARCH LOGIC
  const filteredCrafts = crafts.filter((craft) => {
    if (!search) return true;

    const q = normalizeText(search);

    const title = normalizeText(craft.title || craft.name);
    const seller = normalizeText(
      craft.sellerName || craft.artisanName || craft.seller
    );
    const category = normalizeText(craft.category);
    const location = normalizeText(craft.location || craft.city);

    return (
      title.includes(q) ||
      seller.includes(q) ||
      category.includes(q) ||
      location.includes(q)
    );
  });

  const getImage = (craft) => {
    if (craft.imageUrl) return craft.imageUrl;
    if (craft.image) return craft.image;
    if (Array.isArray(craft.images) && craft.images.length > 0) {
      return craft.images[0];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Marketplace
            </h1>
            <p className="text-gray-700">
              Discover handcrafted pieces from women artisans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* UPDATED SEARCH BAR */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crafts, artisans, categories..."
              className="
                px-4 py-2
                rounded-full
                bg-white
                border border-slate-300
                text-gray-900
                placeholder:text-gray-500
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-orange-300
                w-full md:w-[240px]
              "
            />

            {/* Add Craft button for artisans */}
            {user && role === "artisan" && (
              <Link
                href="/marketplace/new"
                className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm hover:bg-orange-700"
              >
                + Add Craft
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-gray-700">Loading crafts...</p>
          </div>
        ) : filteredCrafts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-gray-700 mb-3">No crafts found.</p>
            {user && role === "artisan" ? (
              <Link
                href="/marketplace/new"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-orange-600 text-white text-sm hover:bg-orange-700"
              >
                Be the first to add a craft
              </Link>
            ) : (
              <p className="text-sm text-gray-500">
                Try adjusting your search.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCrafts.map((craft) => {
              const img = getImage(craft);
              const title =
                craft.title || craft.name || "Handcrafted Item";
              const price =
                typeof craft.price === "number" ? craft.price : 0;
              const seller =
                craft.sellerName || craft.artisanName || "Artisan";
              const location =
                craft.location || craft.city || "Philippines";

              return (
                <Link
                  key={craft.id}
                  href={`/marketplace/${craft.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Image */}
                  {img ? (
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-orange-50 flex items-center justify-center text-orange-500 text-sm font-medium">
                      No Image
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h2 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {title}
                    </h2>
                    <p className="text-sm text-gray-700 font-semibold">
                      ₱{price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {seller} • {location}
                    </p>

                    {craft.category && (
                      <span className="mt-1 inline-flex text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 w-max">
                        {craft.category}
                      </span>
                    )}

                    {craft.shortDescription && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {craft.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
