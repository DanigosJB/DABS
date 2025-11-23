"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ---------- TYPES ---------- */

type Mentor = {
  id: string;
  name?: string;
  title?: string;
  organization?: string;
  bio?: string;
  status?: string;
  specialties?: string | string[];
  rating?: number;
  yearsExperience?: number;
  menteesCount?: number;
  achievements?: string | string[];
};

type MentoringTab = "find" | "sessions";

/* ---------- MENTOR CARD ---------- */

function MentorCard({ mentor }: { mentor: Mentor }) {
  const {
    id,
    name,
    title,
    organization,
    bio,
    status = "Available",
    specialties,
    rating,
    yearsExperience,
    menteesCount,
    achievements,
  } = mentor;

  const specialtiesList = Array.isArray(specialties)
    ? specialties
    : specialties
    ? [specialties]
    : [];

  const achievementsList = Array.isArray(achievements)
    ? achievements
    : achievements
    ? [achievements]
    : [];

  const initials =
    name && typeof name === "string"
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "NA";

  return (
    <article className="flex flex-col rounded-3xl border border-[color:var(--border-soft)] bg-white px-6 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
      {/* TOP: avatar + info + status badge */}
      <div className="mb-4 flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--bg-main)] text-xs font-semibold text-[color:var(--text-main)]">
          {initials}
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-semibold text-[color:var(--text-main)] md:text-base">
            {name || "Mentor name"}
          </h2>
          {(title || organization) && (
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              {title}
              {organization && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-[color:var(--accent-primary)]">
                    {organization}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        {status && (
          <span className="inline-flex items-center rounded-full bg-[color:var(--accent-teal)] px-3 py-[3px] text-[0.7rem] font-semibold text-white">
            {status}
          </span>
        )}
      </div>

      {/* BIO */}
      {bio && (
        <p className="mb-4 text-xs leading-relaxed text-[color:var(--text-muted)] md:text-sm">
          {bio}
        </p>
      )}

      {/* SPECIALTIES */}
      {specialtiesList.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            Specialties
          </p>
          <div className="flex flex-wrap gap-2">
            {specialtiesList.map((sp) => (
              <span
                key={sp}
                className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--bg-main)] px-3 py-[3px] text-[0.7rem] text-[color:var(--text-main)]"
              >
                {sp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STATS ROW */}
      <div className="mb-4 grid grid-cols-3 border-t border-[color:var(--border-soft)] pt-3 text-center text-[0.7rem] text-[color:var(--text-main)] md:text-xs">
        <div>
          <div className="flex items-center justify-center gap-1">
            <span role="img" aria-label="star">
              ⭐
            </span>
            <span>{typeof rating === "number" ? rating.toFixed(1) : "–"}</span>
          </div>
          <p className="mt-1 text-[0.65rem] text-[color:var(--text-muted)]">
            Rating
          </p>
        </div>
        <div>
          <div>{yearsExperience ? `${yearsExperience}+` : "–"}</div>
          <p className="mt-1 text-[0.65rem] text-[color:var(--text-muted)]">
            Years exp.
          </p>
        </div>
        <div>
          <div>{typeof menteesCount === "number" ? menteesCount : "–"}</div>
          <p className="mt-1 text-[0.65rem] text-[color:var(--text-muted)]">
            Mentees
          </p>
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      {achievementsList.length > 0 && (
        <div className="mb-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-4 py-3">
          <p className="mb-1 flex items-center gap-1 text-[0.7rem] font-semibold text-[color:var(--text-main)]">
            <span role="img" aria-label="trophy">
              🏆
            </span>
            Achievements
          </p>
          <ul className="mt-1 list-disc list-inside space-y-1 text-[0.7rem] text-[color:var(--text-muted)]">
            {achievementsList.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* BUTTONS */}
      <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row">
        <button className="h-9 flex-1 rounded-full bg-[color:var(--accent-primary)] text-xs font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.12)] hover:brightness-95 sm:text-sm">
          Request session
        </button>
        <Link
          href={`/mentoring/${id}`}
          className="flex h-9 flex-1 items-center justify-center rounded-full border border-[color:var(--border-soft)] text-xs font-semibold text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)] sm:text-sm"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}

/* ---------- MAIN PAGE COMPONENT ---------- */

export default function MentoringPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MentoringTab>("find");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const snap = await getDocs(collection(db, "mentors"));
        const list: Mentor[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Mentor, "id">),
        }));
        setMentors(list);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] pb-16">
      {/* HEADER */}
      <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-main)]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
              Mentoring
            </p>
            <h1 className="font-display text-2xl leading-tight md:text-3xl">
              Peer mentoring to{" "}
              <span className="underline decoration-[color:var(--accent-primary)] decoration-[0.3em] underline-offset-[0.2em]">
                grow your craft
              </span>
            </h1>
            <p className="max-w-2xl text-xs text-[color:var(--text-muted)] md:text-sm">
              Connect with experienced artisans and student leaders for guidance
              on pricing, branding, production, and balancing school with your
              creative work.
            </p>
          </div>

          {/* TABS */}
          <div className="mt-6 flex justify-start">
            <div className="inline-flex rounded-full bg-[rgba(255,255,255,0.9)] p-1 text-xs shadow-sm md:text-sm">
              <button
                onClick={() => setActiveTab("find")}
                className={`rounded-full px-4 py-1.5 font-medium transition ${
                  activeTab === "find"
                    ? "bg-[color:var(--accent-teal)] text-white shadow"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
                }`}
              >
                Find a mentor
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`rounded-full px-4 py-1.5 font-medium transition ${
                  activeTab === "sessions"
                    ? "bg-[color:var(--accent-teal)] text-white shadow"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
                }`}
              >
                My sessions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        {activeTab === "sessions" ? (
          <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-6 text-sm text-[color:var(--text-muted)]">
            You don&apos;t have any mentoring sessions yet. Once you request a
            session with a mentor, it will appear here with the date, time, and
            meeting link.
          </div>
        ) : (
          <>
            {loading && (
              <p className="text-sm text-[color:var(--text-muted)]">
                Loading mentors…
              </p>
            )}

            {!loading && mentors.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-8 text-sm text-[color:var(--text-muted)]">
                No mentors have been added yet. Ask your admin to add mentor
                profiles in the <code>mentors</code> collection in Firestore.
              </div>
            )}

            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
