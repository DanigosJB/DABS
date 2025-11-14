"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function WorkshopDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Load workshop
  useEffect(() => {
    if (!id) return;

    const fetchWorkshop = async () => {
      try {
        const ref = doc(db, "workshops", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setWorkshop({ id: snap.id, ...snap.data() });
        } else {
          setError("Workshop not found.");
        }
      } catch (err) {
        console.error("Error loading workshop:", err);
        setError("Failed to load workshop.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  // Load user + role
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
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setRole(snap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error loading role:", err);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const canManage =
    !roleLoading &&
    user &&
    workshop &&
    (role === "admin" || (role === "artisan" && workshop.ownerUid === user.uid));

  const handleDelete = async () => {
    if (!canManage || !id) return;
    const ok = window.confirm("Delete this workshop?");
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "workshops", id));
      router.push("/workshops");
    } catch (err) {
      console.error("Error deleting workshop:", err);
      setError("Failed to delete workshop.");
      setDeleting(false);
    }
  };

  /* RENDER STATES */

  if (!id) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-600">Loading workshop...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-slate-600">Loading workshop...</p>
      </main>
    );
  }

  if (error || !workshop) {
    return (
      <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
        <p className="text-red-600">{error || "Workshop not found."}</p>
        <Link href="/workshops" className="text-orange-600 hover:underline">
          ← Back to workshops
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7EF] px-12 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/workshops" className="text-sm text-orange-600 hover:underline">
          ← Back to workshops
        </Link>

        <div className="mt-4 bg-white rounded-2xl shadow-md border border-orange-100 p-6">
          <p className="text-sm text-orange-600 font-semibold mb-1">
            {workshop.date} {workshop.time && `• ${workshop.time}`}
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {workshop.title}
          </h1>

          <p className="text-sm text-slate-500 mb-4">
            {workshop.location || "Online / To be announced"}
          </p>

          {workshop.capacity && (
            <p className="text-sm text-slate-600 mb-2">
              Capacity:{" "}
              <span className="font-semibold">{workshop.capacity} participants</span>
            </p>
          )}

          {workshop.description && (
            <p className="text-sm text-slate-700 mb-6 whitespace-pre-line">
              {workshop.description}
            </p>
          )}

          {workshop.registrationLink && (
            <a
              href={workshop.registrationLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Register for this workshop
            </a>
          )}

          {!workshop.registrationLink && (
            <p className="text-sm text-slate-500 mt-4">
              Registration details will be announced soon.
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {canManage && (
            <div className="mt-6 flex gap-3">
              {/* You can create an /workshops/edit page later if you like */}
              {/* For now just show Delete for demo */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Workshop"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
