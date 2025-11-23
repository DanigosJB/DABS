"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

type Role = "buyer" | "artisan" | "admin" | null;

type Craft = {
  title: string;
  artisanName: string;
  location: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  ownerUid?: string;
  createdAt?: any;
};

export default function CraftDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [craft, setCraft] = useState<Craft | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

    const fetchCraft = async () => {
      try {
        const snap = await getDoc(doc(db, "crafts", id));
        if (!snap.exists()) {
          setNotFound(true);
          setCraft(null);
        } else {
          setCraft(snap.data() as Craft);
          setNotFound(false);
        }
      } catch (err) {
        console.error("Error loading craft:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCraft();
  }, [id]);

  const canEdit =
    !roleLoading &&
    user &&
    craft &&
    (role === "admin" || craft.ownerUid === user.uid);

  /* ---------- UI STATES ---------- */

  if (!id) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Invalid craft ID.
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
          Loading craft details…
        </div>
      </main>
    );
  }

  if (notFound || !craft) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8">
          <h1 className="text-xl font-semibold text-[color:var(--text-main)] md:text-2xl">
            Craft not found
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            This listing may have been removed or is no longer available.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex rounded-full bg-[color:var(--accent-teal)] px-5 py-2 text-sm font-medium text-white"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- MAIN UI ---------- */

  const createdDate =
    craft.createdAt?.toDate?.() instanceof Date
      ? (craft.createdAt.toDate() as Date)
      : null;

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-start">
        {/* IMAGE / HERO SIDE */}
        <section className="md:w-1/2">
          <div className="overflow-hidden rounded-[2rem] border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="relative aspect-[4/5] w-full">
              {craft.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={craft.imageUrl}
                  alt={craft.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[color:var(--accent-teal)]/50 via-[color:var(--bg-main)] to-[color:var(--accent-primary)]/60" />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent" />
            </div>

            <div className="space-y-2 px-5 py-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
                {craft.category || "Handcrafted piece"}
              </p>
              <p className="text-xs text-[color:var(--text-muted)]">
                {createdDate && (
                  <>
                    Listed on{" "}
                    {createdDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* DETAILS SIDE */}
        <section className="flex-1 space-y-6">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent-teal)]"
            >
              ← Back to marketplace
            </button>

            <h1 className="text-2xl font-semibold text-[color:var(--text-main)] md:text-3xl">
              {craft.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--text-muted)]">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[color:var(--accent-teal)]">
                {craft.artisanName}
              </span>
              {craft.location && (
                <span className="text-xs">
                  Based in{" "}
                  <span className="font-medium text-[color:var(--text-main)]">
                    {craft.location}
                  </span>
                </span>
              )}
            </div>

            <p className="text-2xl font-semibold text-[color:var(--accent-secondary)]">
              ₱{craft.price?.toLocaleString()}
            </p>
          </div>

          {/* DESCRIPTION */}
          {craft.description && (
            <div className="space-y-2 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-4 py-3 text-sm text-[color:var(--text-muted)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-teal)]">
                About this piece
              </p>
              <p className="leading-relaxed whitespace-pre-line">
                {craft.description}
              </p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 pt-2">
            {/* Message artisan */}
            <button
              type="button"
              className="rounded-full bg-[color:var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              Message artisan
            </button>

            {/* Save to favorites */}
            <button
              type="button"
              className="rounded-full border border-[color:var(--border-soft)] bg-white px-5 py-2.5 text-sm font-medium text-[color:var(--accent-teal)] hover:bg-[color:var(--accent-teal)] hover:text-white"
            >
              Save to favorites
            </button>

            {/* Edit listing – owner artisan or admin */}
            {canEdit && (
              <Link
                href={`/marketplace/${id}/edit`}
                className="rounded-full border border-[color:var(--accent-secondary)] bg-white px-5 py-2.5 text-sm font-medium text-[color:var(--accent-secondary)] hover:bg-[color:var(--accent-secondary)] hover:text-white"
              >
                Edit listing
              </Link>
            )}

            {/* Delete listing – owner artisan or admin */}
            {canEdit && (
              <Link
                href={`/marketplace/${id}/delete`}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Delete listing
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
