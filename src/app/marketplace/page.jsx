"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function MarketplacePage() {
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  /* -------------------------
     LOAD CRAFTS 
  -------------------------- */
  useEffect(() => {
    const fetchCrafts = async () => {
      try {
        const snap = await getDocs(collection(db, "crafts"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCrafts(list);
      } catch (err) {
        console.error("Error fetching crafts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCrafts();
  }, []);

  /* -------------------------
     LOAD USER ROLE
  -------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setRole(snap.data().role); // buyer | artisan | admin
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error loading role:", error);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      {/* ---------------------------------- */}
      {/* HEADER + ADD BUTTON (role-based)   */}
      {/* ---------------------------------- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">DABS Marketplace</h1>

        {/* Show Add Craft button only for artisan/admin */}
        {!roleLoading && (role === "artisan" || role === "admin") && (
          <Link href="/marketplace/new">
            <button className="px-5 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold shadow hover:bg-orange-700">
              + Add Craft
            </button>
          </Link>
        )}
      </div>

      {/* ---------------------------------- */}
      {/* CRAFT LIST                         */}
      {/* ---------------------------------- */}

      {loading && <p className="text-slate-600">Loading crafts...</p>}

      {!loading && crafts.length === 0 && (
        <p className="text-slate-600">No crafts yet. Add some in Firestore.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {crafts.map((craft) => (
          <div
            key={craft.id}
            className="rounded-2xl bg-white shadow-md overflow-hidden border border-orange-100"
          >
            <div className="h-40 bg-slate-200 overflow-hidden">
              {craft.imageUrl && (
                <img
                  src={craft.imageUrl}
                  alt={craft.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1 text-slate-900">
                {craft.title}
              </h2>
              <p className="text-sm text-slate-500 mb-2">
                {craft.artisanName} • {craft.location}
              </p>
              <p className="text-sm text-orange-600 font-semibold mb-3">
                ₱{craft.price}
              </p>

              <Link href={`/marketplace/${craft.id}`} className="block">
                <button className="w-full rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
