"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

type Role = "buyer" | "artisan" | "admin" | null;

type Workshop = {
  id: string;
  title: string;
  category?: "Financial" | "Marketing" | "Technical" | string;
  mode?: string;
  level?: string;
  instructor?: string;
  shortDescription?: string;
  description?: string;
  date?: string;
  time?: string;
  enrolled?: number;
  capacity?: number;
  location?: string;
  registrationLink?: string;
  ownerUid?: string;
};

type TabKey = "Financial" | "Marketing" | "Technical";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "Financial", label: "Financial", icon: "₱" },
  { key: "Marketing", label: "Marketing", icon: "📊" },
  { key: "Technical", label: "Technical", icon: "🛠️" },
];

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<TabKey>("Financial");

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);

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
          setRole((snap.data().role as Role) || null);
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

  // Load workshops
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const snap = await getDocs(collection(db, "workshops"));
        const list: Workshop[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Workshop, "id">),
        }));
        setWorkshops(list);
      } catch (err) {
        console.error("Error loading workshops:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const filtered = workshops.filter(
    (w) =>
      (w.category || "Financial").toLowerCase() === selectedTab.toLowerCase()
  );

  const canCreate =
    !roleLoading && user && (role === "artisan" || role === "admin");

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] pb-16">
      <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-main)]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          {/* HEADER + ADD BUTTON */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
                Workshops
              </p>
              <h1 className="font-display text-2xl leading-tight md:text-3xl">
                Workshops for{" "}
                <span className="underline decoration-[color:var(--accent-primary)] decoration-[0.3em] underline-offset-[0.2em]">
                  growing your craft
                </span>
              </h1>
              <p className="max-w-2xl text-xs text-[color:var(--text-muted)] md:text-sm">
                Financial, marketing, and technical sessions designed to
                empower artisans with the tools to sustain and scale their
                creative work.
              </p>
            </div>

            {canCreate && (
              <Link
                href="/workshops/new"
                className="inline-flex items-center rounded-full bg-[color:var(--accent-primary)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm hover:brightness-95"
              >
                + Add workshop
              </Link>
            )}
          </div>

          {/* TAB BAR – WIDER PILL */}
          <div className="mt-8 flex justify-center md:justify-start">
            <div className="mx-auto flex w-full max-w-4xl md:max-w-5xl items-center rounded-full bg-[rgba(255,255,255,0.9)] px-2 py-2 shadow-sm">
              {TABS.map((tab) => {
                const active = selectedTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key)}
                    className={`flex-1 rounded-full px-4 py-2 text-xs font-medium transition md:text-sm ${
                      active
                        ? "bg-[color:var(--accent-teal)] text-white shadow"
                        : "text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
                    }`}
                  >
                    <span className="mr-2 text-xs">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        {loading ? (
          <p className="text-sm text-[color:var(--text-muted)]">
            Loading workshops…
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-[color:var(--border-soft)] bg-[color:var(--bg-card)]/80 px-6 py-10 text-center">
            <p className="text-sm text-[color:var(--text-muted)]">
              No workshops in this category yet. Check back soon or switch
              to another tab.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ---- Card component ---- */

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const {
    id,
    title,
    mode,
    level,
    instructor,
    shortDescription,
    date,
    time,
    enrolled,
    capacity,
  } = workshop;

  const spotsLeft =
    typeof capacity === "number" && typeof enrolled === "number"
      ? capacity - enrolled
      : null;

  return (
    <div className="flex flex-col rounded-3xl border border-[color:var(--border-soft)] bg-white px-6 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
      {/* Top badges */}
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-[color:var(--accent-teal)] px-3 py-[3px] text-xs font-semibold text-white">
          {mode || "Online"}
        </span>
        {level && (
          <span className="inline-flex items-center rounded-full border border-[color:var(--border-soft)] px-3 py-[3px] text-[0.7rem] font-medium text-[color:var(--text-muted)]">
            {level}
          </span>
        )}
      </div>

      {/* Title + instructor */}
      <h2 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
        {title}
      </h2>
      {instructor && (
        <p className="mt-2 text-xs text-[color:var(--text-muted)] md:text-sm">
          {instructor}
        </p>
      )}

      {/* Description */}
      {shortDescription && (
        <p className="mt-3 text-xs leading-relaxed text-[color:var(--text-muted)] md:text-sm line-clamp-4">
          {shortDescription}
        </p>
      )}

      {/* Date / Time / Enrolled */}
      <div className="mt-4 space-y-1 text-xs text-[color:var(--text-main)] md:text-sm">
        {date && (
          <p className="flex items-center gap-2">
            <span role="img" aria-label="calendar">
              📅
            </span>
            <span>{date}</span>
          </p>
        )}
        {time && (
          <p className="flex items-center gap-2">
            <span role="img" aria-label="clock">
              ⏰
            </span>
            <span>{time}</span>
          </p>
        )}
        {(enrolled !== undefined || capacity !== undefined) && (
          <p className="flex items-center gap-2">
            <span role="img" aria-label="people">
              👥
            </span>
            <span className="text-[color:var(--text-muted)]">
              {enrolled || 0}/{capacity || 0} enrolled{" "}
              {spotsLeft !== null && (
                <span className="text-[color:var(--accent-primary)]">
                  ({spotsLeft} spots left)
                </span>
              )}
            </span>
          </p>
        )}
      </div>

      {/* Button */}
      <Link href={`/workshops/${id}`} className="mt-5">
        <button className="h-10 w-full rounded-full bg-[color:var(--accent-primary)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:brightness-95">
          Enroll now
        </button>
      </Link>
    </div>
  );
}
