"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

type Role = "buyer" | "artisan" | "admin" | null;

type Craft = {
  title: string;
  artisanName: string;
  location?: string;
  category?: string;
  price?: number;
  ownerUid?: string;
};

export default function DeleteCraftPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [craft, setCraft] = useState<Craft | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  /* ---------- AUTH + ROLE ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", u.uid));
        if (userSnap.exists()) {
          setRole((userSnap.data().role as Role) || null);
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

  /* ---------- LOAD CRAFT ---------- */
  useEffect(() => {
    if (!id) return;

    const loadCraft = async () => {
      try {
        const snap = await getDoc(doc(db, "crafts", id));
        if (!snap.exists()) {
          setCraft(null);
          setError("Craft not found.");
        } else {
          setCraft(snap.data() as Craft);
          setError("");
        }
      } catch (err) {
        console.error("Error loading craft:", err);
        setError("Failed to load craft.");
        setCraft(null);
      } finally {
        setLoading(false);
      }
    };

    loadCraft();
  }, [id]);

  const canDelete =
    !roleLoading &&
    !!user &&
    !!craft &&
    (role === "admin" || craft.ownerUid === user?.uid);

  /* ---------- HANDLE DELETE ---------- */

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canDelete || !id) {
      setError("You are not allowed to delete this listing.");
      return;
    }

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "crafts", id));
      router.push("/marketplace");
    } catch (err) {
      console.error("Error deleting craft:", err);
      setError("Failed to delete this listing. Please try again.");
      setDeleting(false);
    }
  };

  /* ---------- UI STATES ---------- */

  if (!id) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Invalid craft ID.
        </div>
      </main>
    );
  }

  if (loading || roleLoading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Checking permissions and loading listing…
        </div>
      </main>
    );
  }

  if (!craft) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8">
          <p className="text-sm text-[color:var(--text-muted)]">
            {error || "This craft could not be found."}
          </p>
          <Link
            href="/marketplace"
            className="inline-flex rounded-full bg-[color:var(--accent-teal)] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  if (!user || !canDelete) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8">
          <h1 className="text-xl font-semibold text-[color:var(--text-main)] md:text-2xl">
            You don&apos;t have permission to delete this listing.
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            Only the artisan who owns this craft or an admin can delete it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/marketplace/${id}`}
              className="rounded-full bg-[color:var(--accent-teal)] px-5 py-2 text-sm font-semibold text-white"
            >
              Back to craft
            </Link>
            <Link
              href="/marketplace"
              className="rounded-full border border-[color:var(--border-soft)] bg-white px-5 py-2 text-sm font-medium text-[color:var(--accent-teal)] hover:bg-[color:var(--accent-teal)] hover:text-white"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- CONFIRMATION UI ---------- */

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={() => router.push(`/marketplace/${id}`)}
          className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[color:var(--accent-teal)] hover:underline"
        >
          ← Back to craft
        </button>

        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-red-500">
            Delete listing
          </p>
          <h1 className="text-2xl font-semibold text-[color:var(--text-main)] md:text-3xl">
            Are you sure you want to delete this craft?
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            This action can&apos;t be undone. Buyers will no longer see this
            listing in the marketplace.
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/90 px-4 py-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-teal)]">
            You&apos;re about to delete
          </p>
          <p className="mt-1 text-base font-semibold text-[color:var(--text-main)]">
            {craft.title}
          </p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            {craft.artisanName}
            {craft.location ? ` • ${craft.location}` : ""}
          </p>
          {craft.price !== undefined && (
            <p className="mt-2 text-sm font-semibold text-[color:var(--accent-secondary)]">
              ₱{craft.price.toLocaleString()}
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form
          onSubmit={handleDelete}
          className="flex flex-wrap gap-3 pt-1"
        >
          <button
            type="submit"
            disabled={deleting}
            className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Yes, delete this listing"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/marketplace/${id}`)}
            className="rounded-full border border-[color:var(--border-soft)] bg-white px-6 py-2.5 text-sm font-medium text-[color:var(--accent-teal)] hover:bg-[color:var(--accent-teal)] hover:text-white"
          >
            Cancel
          </button>
        </form>
      </div>
    </main>
  );
}
