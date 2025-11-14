"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function CraftDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [craft, setCraft] = useState(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "buyer" | "artisan" | "admin"
  const [roleLoading, setRoleLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  /* --------- LOAD CRAFT --------- */
  useEffect(() => {
    if (!id) return;

    const fetchCraft = async () => {
      try {
        const ref = doc(db, "crafts", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCraft({ id: snap.id, ...snap.data() });
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

    fetchCraft();
  }, [id]);

  /* --------- LOAD USER + ROLE --------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role || null); // buyer | artisan | admin
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error loading user role:", err);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Only admins OR the artisan that owns this craft can manage
  const canManage =
    !roleLoading &&
    user &&
    craft &&
    (role === "admin" || (role === "artisan" && craft.ownerUid === user.uid));

  /* --------- DELETE HANDLER --------- */
  const handleDelete = async () => {
    if (!canManage || !id) return;

    const ok = window.confirm("Are you sure you want to delete this craft?");
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "crafts", id));
      router.push("/marketplace");
    } catch (err) {
      console.error("Error deleting craft:", err);
      setError("Failed to delete craft.");
      setDeleting(false);
    }
  };

  /* --------- RENDER --------- */

  if (!id) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-600">Loading craft...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-600">Loading craft...</p>
      </main>
    );
  }

  if (error || !craft) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-red-600">{error || "Craft not found."}</p>
        <Link href="/marketplace" className="text-orange-600 hover:underline">
          ← Back to marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/marketplace"
          className="text-sm text-orange-600 hover:underline"
        >
          ← Back to marketplace
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          {/* IMAGE CARD */}
          <div className="rounded-2xl bg-white shadow-md overflow-hidden border border-orange-100">
            <div className="h-64 bg-slate-200 overflow-hidden">
              {craft.imageUrl && (
                <img
                  src={craft.imageUrl}
                  alt={craft.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {craft.title}
            </h1>
            <p className="text-sm text-slate-500 mb-2">
              {craft.artisanName} • {craft.location}
            </p>
            <p className="text-xl text-orange-600 font-semibold mb-4">
              ₱{craft.price}
            </p>

            {craft.description && (
              <p className="text-sm text-slate-700 mb-6">{craft.description}</p>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">
                {error}
              </p>
            )}

            {/* PRIMARY ACTIONS */}
            <div className="flex flex-wrap gap-3">
              {/* Message Artisan – visible to everyone */}
              <button
                type="button"
                className="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Message Artisan
              </button>

              {/* Only owner artisan or admin sees Edit/Delete */}
              {canManage && (
                <>
                  <Link href={`/marketplace/edit?id=${craft.id}`}>
                    <button
                      type="button"
                      className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                    >
                      Edit Craft
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete Craft"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
