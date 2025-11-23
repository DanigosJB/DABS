"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

type Role = "buyer" | "artisan" | "admin" | null;

type Workshop = {
  id: string;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: number;
  description?: string;
  registrationLink?: string;
  ownerUid?: string;
};

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  /* ---------- LOAD WORKSHOP ---------- */
  useEffect(() => {
    if (!id) return;

    const fetchWorkshop = async () => {
      try {
        const ref = doc(db, "workshops", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setWorkshop({ id: snap.id, ...(snap.data() as Omit<Workshop, "id">) });
          setError("");
        } else {
          setError("Workshop not found.");
          setWorkshop(null);
        }
      } catch (err) {
        console.error("Error loading workshop:", err);
        setError("Failed to load workshop.");
        setWorkshop(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  /* ---------- LOAD USER + ROLE ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
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
          setRole((snap.data().role as Role) ?? null);
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
    !!user &&
    !!workshop &&
    (role === "admin" ||
      (role === "artisan" && workshop.ownerUid === user.uid));

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

  /* ---------- RENDER STATES ---------- */

  if (!id) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Invalid workshop ID.
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Loading workshop…
        </div>
      </main>
    );
  }

  if (error || !workshop) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8">
          <h1 className="text-xl font-semibold text-[color:var(--text-main)] md:text-2xl">
            Workshop not found
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            {error || "This workshop may have been removed or is no longer available."}
          </p>
          <Link
            href="/workshops"
            className="inline-flex rounded-full bg-[color:var(--accent-teal)] px-5 py-2 text-sm font-medium text-white"
          >
            ← Back to workshops
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- MAIN UI ---------- */

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/workshops"
          className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent-teal)] hover:underline"
        >
          ← Back to workshops
        </Link>

        <section className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-6 shadow-[0_20px_40px_rgba(0,0,0,0.10)] md:px-8 md:py-7">
          {/* Date / time badge */}
          {(workshop.date || workshop.time) && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-primary)]">
              {workshop.date}
              {workshop.time ? ` • ${workshop.time}` : ""}
            </p>
          )}

          {/* Title */}
          <h1 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)] md:text-3xl">
            {workshop.title || "Untitled workshop"}
          </h1>

          {/* Location */}
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
            {workshop.location || "Online / To be announced"}
          </p>

          {/* Capacity */}
          {typeof workshop.capacity === "number" && (
            <p className="mt-3 text-sm text-[color:var(--text-main)]">
              Capacity:{" "}
              <span className="font-semibold">
                {workshop.capacity} participant
                {workshop.capacity === 1 ? "" : "s"}
              </span>
            </p>
          )}

          {/* Description */}
          {workshop.description && (
            <div className="mt-5 rounded-2xl border border-[color:var(--border-soft)] bg-white/90 px-4 py-3 text-sm text-[color:var(--text-muted)]">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-teal)]">
                What you&apos;ll learn
              </p>
              <p className="whitespace-pre-line leading-relaxed">
                {workshop.description}
              </p>
            </div>
          )}

          {/* Registration */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {workshop.registrationLink ? (
              <a
                href={workshop.registrationLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-[color:var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
              >
                Register for this workshop
              </a>
            ) : (
              <p className="text-sm text-[color:var(--text-muted)]">
                Registration details will be announced soon.
              </p>
            )}

            {canManage && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete workshop"}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
