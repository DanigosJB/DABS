"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const TABS = [
  { key: "Financial", label: "Financial", icon: "₱" },
  { key: "Marketing", label: "Marketing", icon: "📊" },
  { key: "Technical", label: "Technical", icon: "🛠️" },
];

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState("Financial");

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Load user + role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        return;
      }

      const { doc, getDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) setRole(snap.data().role);
    });

    return () => unsub();
  }, []);

  // Load workshops
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const snap = await getDocs(collection(db, "workshops"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorkshops(list);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const filtered = workshops.filter(
    (w) => w.category?.toLowerCase() === selectedTab.toLowerCase()
  );

  const canCreate = user && (role === "artisan" || role === "admin");

  return (
    <main className="min-h-screen bg-[#FFF7EF]">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* HEADER + ADD BUTTON */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Financial Literacy &amp; Skills Workshops
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-2xl">
              Empowering artisans with knowledge and skills to grow their
              businesses.
            </p>
          </div>

          {canCreate && (
            <Link href="/workshops/new">
              <button className="px-5 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold shadow hover:bg-orange-700">
                + Add Workshop
              </button>
            </Link>
          )}
        </div>

        {/* TAB BAR (Figma style) */}
        <div className="mb-10">
          <div className="w-full max-w-3xl bg-[#F4F4F6] rounded-full h-9 flex items-center px-1 shadow-sm">
            {TABS.map((tab) => {
              const active = selectedTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`flex-1 h-7 mx-1 flex items-center justify-center gap-2 rounded-full text-xs sm:text-sm font-medium transition ${
                    active
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-slate-600 text-sm">Loading workshops...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-600 text-sm">
            No workshops for this category yet.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {filtered.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---- Card component styled to match the Figma ---- */

function WorkshopCard({ workshop }) {
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 flex flex-col">
      {/* Top badges */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-3 py-[3px] rounded-full text-xs font-medium bg-black text-white">
          {mode || "Online"}
        </span>
        {level && (
          <span className="inline-flex items-center px-3 py-[3px] rounded-full text-[11px] font-medium border border-slate-300 text-slate-600">
            {level}
          </span>
        )}
      </div>

      {/* Title + instructor */}
      <h2 className="text-sm sm:text-base font-semibold text-slate-900">
        {title}
      </h2>
      {instructor && (
        <p className="mt-2 text-xs sm:text-sm text-slate-600">{instructor}</p>
      )}

      {/* Description */}
      {shortDescription && (
        <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-4">
          {shortDescription}
        </p>
      )}

      {/* Date / Time / Enrolled */}
      <div className="mt-4 space-y-1 text-xs sm:text-sm text-slate-700">
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
            <span>
              {enrolled || 0}/{capacity || 0} enrolled{" "}
              {spotsLeft !== null && (
                <span className="text-orange-600">
                  ({spotsLeft} spots left)
                </span>
              )}
            </span>
          </p>
        )}
      </div>

      {/* Button */}
      <Link href={`/workshops/${id}`} className="mt-5">
        <button className="w-full h-10 rounded-full bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700">
          Enroll Now
        </button>
      </Link>
    </div>
  );
}
