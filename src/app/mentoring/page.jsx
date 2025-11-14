"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ---------- MENTOR CARD ---------- */

function MentorCard({ mentor }) {
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

  // Make sure these are arrays before mapping
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
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 flex flex-col">
      {/* TOP: avatar + info + status badge */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar circle */}
        <div className="h-10 w-10 rounded-full bg-[#F5F5F8] flex items-center justify-center text-xs font-semibold text-slate-700">
          {initials}
        </div>

        <div className="flex-1">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            {name || "Mentor Name"}
          </h2>
          {(title || organization) && (
            <p className="text-xs text-slate-600 mt-1">
              {title}
              {organization && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-orange-600">{organization}</span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Status badge */}
        {status && (
          <span className="inline-flex items-center px-3 py-[3px] rounded-full text-[11px] font-medium bg-black text-white">
            {status}
          </span>
        )}
      </div>

      {/* BIO */}
      {bio && (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
          {bio}
        </p>
      )}

      {/* SPECIALTIES */}
      {specialtiesList.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-slate-500 mb-2">
            Specialties:
          </p>
          <div className="flex flex-wrap gap-2">
            {specialtiesList.map((sp) => (
              <span
                key={sp}
                className="px-3 py-[2px] rounded-full border border-slate-200 bg-[#F7F7FA] text-[11px] text-slate-700"
              >
                {sp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STATS ROW */}
      <div className="grid grid-cols-3 text-center text-[11px] sm:text-xs text-slate-700 mb-4 pt-3 border-t border-slate-100">
        <div>
          <div className="flex items-center justify-center gap-1">
            <span role="img" aria-label="star">
              ⭐
            </span>
            <span>{typeof rating === "number" ? rating.toFixed(1) : "–"}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Rating</p>
        </div>
        <div>
          <div>{yearsExperience ? `${yearsExperience}+` : "–"}</div>
          <p className="text-[10px] text-slate-500 mt-1">Years Exp.</p>
        </div>
        <div>
          <div>{typeof menteesCount === "number" ? menteesCount : "–"}</div>
          <p className="text-[10px] text-slate-500 mt-1">Mentees</p>
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      {achievementsList.length > 0 && (
        <div className="mb-4 rounded-lg bg-[#FAFAFC] border border-slate-100 px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <span role="img" aria-label="trophy">
              🏆
            </span>
            Achievements
          </p>
          <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 mt-1">
            {achievementsList.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* BUTTONS */}
      <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-2">
        <button className="flex-1 rounded-full bg-orange-600 text-white text-xs sm:text-sm font-semibold h-9 hover:bg-orange-700">
          Request Session
        </button>
        <Link
          href={`/mentoring/${id}`}
          className="flex-1 rounded-full border border-slate-300 text-xs sm:text-sm font-semibold h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

/* ---------- MAIN PAGE COMPONENT (DEFAULT EXPORT) ---------- */

export default function MentoringPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("find");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const snap = await getDocs(collection(db, "mentors"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
    <main className="min-h-screen bg-[#FFF7EF] px-6 sm:px-10 py-10">
      {/* PAGE HEADER */}
      <section className="max-w-5xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Peer Mentoring Program
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Connect with experienced artisans and business coaches to grow your
          skills.
        </p>

        {/* SMALL TABS: Find a mentor / My sessions */}
        <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("find")}
            className={`px-4 py-1 rounded-full ${
              activeTab === "find"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Find a Mentor
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-1 rounded-full ${
              activeTab === "sessions"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            My Sessions
          </button>
        </div>
      </section>

      {/* CONTENT AREA */}
      <section className="max-w-5xl mx-auto">
        {activeTab === "sessions" ? (
          <div className="text-slate-600 text-sm">
            {/* You can replace this with a real “My sessions” list later */}
            You don&apos;t have any mentoring sessions yet. Once you book a
            session with a mentor, it will appear here.
          </div>
        ) : (
          <>
            {loading && (
              <p className="text-slate-600 text-sm">Loading mentors...</p>
            )}

            {!loading && mentors.length === 0 && (
              <p className="text-slate-600 text-sm">
                No mentors added yet. Ask your admin to add mentor profiles in
                Firestore (collection: <code>mentors</code>).
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
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
