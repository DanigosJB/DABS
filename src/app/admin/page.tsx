"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [pendingOrders, setPendingOrders] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // ---------- AUTH + ROLE ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role !== "admin") {
          router.push("/");
          return;
        }

        setIsAdmin(true);
        await loadDashboardData();
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadDashboardData = async () => {
    // crafts
    const craftsSnap = await getDocs(collection(db, "crafts"));
    const crafts = craftsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const active = crafts.filter((c: any) => c.status !== "archived").length;
    setActiveListings(active);

    // orders
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const pending = orders.filter(
      (o: any) => (o.status || "").toLowerCase() === "pending"
    ).length;
    setPendingOrders(pending);

    // revenue this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let revenue = 0;
    orders.forEach((o: any) => {
      const amount = typeof o.totalAmount === "number" ? o.totalAmount : 0;

      if (o.createdAt && typeof o.createdAt.toDate === "function") {
        const d = o.createdAt.toDate();
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          revenue += amount;
        }
      }
    });
    setMonthRevenue(revenue);

    // latest 5
    const sorted = [...orders].sort((a: any, b: any) => {
      const ta =
        a.createdAt && typeof a.createdAt.toDate === "function"
          ? a.createdAt.toDate().getTime()
          : 0;
      const tb =
        b.createdAt && typeof b.createdAt.toDate === "function"
          ? b.createdAt.toDate().getTime()
          : 0;
      return tb - ta;
    });

    setRecentOrders(sorted.slice(0, 5));
  };

  // ---------- HELPERS ----------

  const formatCurrency = (value: any) => {
    const num = typeof value === "number" ? value : 0;
    return `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatusBadge = (statusRaw: any) => {
    const status = (statusRaw || "").toLowerCase();
    let label = status || "unknown";
    let color =
      "bg-slate-100 text-slate-700 border border-slate-200";

    if (status === "pending") {
      label = "Pending";
      color =
        "bg-[color:var(--accent-primary)]/10 text-[color:var(--accent-primary)] border border-[color:var(--accent-primary)]/30";
    } else if (status === "completed") {
      label = "Completed";
      color =
        "bg-emerald-50 text-emerald-700 border border-emerald-200";
    } else if (status === "processing") {
      label = "Processing";
      color =
        "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)] border border-[color:var(--accent-teal)]/30";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${color}`}
      >
        {label}
      </span>
    );
  };

  const formatDate = (ts: any) => {
    if (!ts || typeof ts.toDate !== "function") return "";
    const d = ts.toDate();
    return d.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderTitle = (order: any) => {
    if (Array.isArray(order.items) && order.items.length > 0) {
      const first = order.items[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first.title) return first.title;
    }
    return order.title || order.craftTitle || "Order";
  };

  const getOrderBuyer = (order: any) => {
    return order.buyerName || order.buyerEmail || order.buyer || "Buyer";
  };

  // ---------- RENDER ----------

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] flex items-center justify-center">
        <p className="text-sm text-[color:var(--text-muted)]">
          Loading dashboard…
        </p>
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] pb-16">
      <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-main)]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center rounded-full border border-[color:var(--border-soft)] bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-teal)]">
                Admin • Overview
              </p>
              <h1 className="font-display text-2xl leading-tight text-[color:var(--text-main)] md:text-3xl">
                Platform health at a{" "}
                <span className="underline decoration-[color:var(--accent-primary)] decoration-[0.25em] underline-offset-[0.18em]">
                  quick glance
                </span>
              </h1>
              <p className="max-w-xl text-xs text-[color:var(--text-muted)] md:text-sm">
                Track orders, active listings, and monthly revenue to keep the
                DABS marketplace running smoothly for your artisans and buyers.
              </p>
            </div>

            <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-4 py-3 text-right text-[0.7rem] text-[color:var(--text-muted)]">
              <p className="font-semibold text-[color:var(--accent-teal)]">
                Today
              </p>
              <p>
                {new Date().toLocaleDateString("en-PH", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 pt-8 space-y-6">
        {/* Top stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Pending Orders */}
          <div className="flex flex-col rounded-3xl border border-[color:var(--border-soft)] bg-white px-5 py-4 shadow-[0_14px_26px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Pending orders
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Orders waiting for action
                </p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-primary)]/15 text-sm text-[color:var(--accent-primary)]">
                🧾
              </span>
            </div>
            <p className="text-3xl font-semibold text-[color:var(--text-main)]">
              {pendingOrders}
            </p>
          </div>

          {/* Active Listings */}
          <div className="flex flex-col rounded-3xl border border-[color:var(--border-soft)] bg-white px-5 py-4 shadow-[0_14px_26px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Active listings
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Crafts currently visible in the marketplace
                </p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-teal)]/15 text-sm text-[color:var(--accent-teal)]">
                🧺
              </span>
            </div>
            <p className="text-3xl font-semibold text-[color:var(--text-main)]">
              {activeListings}
            </p>
          </div>

          {/* Revenue */}
          <div className="flex flex-col rounded-3xl border border-[color:var(--border-soft)] bg-gradient-to-br from-[color:var(--accent-primary)]/18 via-white to-[color:var(--accent-teal)]/10 px-5 py-4 shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  This month
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Estimated platform revenue
                </p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-primary)] text-xs font-semibold text-white">
                ₱
              </span>
            </div>
            <p className="text-2xl font-semibold text-[color:var(--text-main)]">
              {formatCurrency(monthRevenue)}
            </p>
          </div>
        </div>

        {/* Middle row: recent orders + placeholder panel */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr,1fr]">
          {/* Recent Orders */}
          <div className="flex flex-col rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-5 py-5 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[color:var(--text-main)]">
                  Recent orders
                </p>
                <p className="text-xs text-[color:var(--text-muted)]">
                  Last {recentOrders.length} orders placed on the platform
                </p>
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-[color:var(--text-muted)]">
                No orders have been placed yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-2xl bg-white px-3 py-2.5 text-xs shadow-sm"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-[color:var(--text-main)]">
                        {getOrderTitle(order)}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-[color:var(--text-muted)]">
                        {getOrderBuyer(order)} • {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-[color:var(--text-main)]">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {formatStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-full border border-[color:var(--accent-teal)]/40 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-teal)] hover:bg-[color:var(--accent-teal)] hover:text-white"
              >
                View all orders
              </button>
            </div>
          </div>

          {/* Side panel / notifications placeholder */}
          <div className="rounded-3xl border border-[color:var(--border-soft)] bg-white px-5 py-5 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold text-[color:var(--text-main)]">
              Next steps
            </p>
            <p className="mt-2 text-xs text-[color:var(--text-muted)]">
              In future phases, this space can show alerts such as:
            </p>
            <ul className="mt-3 space-y-1 text-xs text-[color:var(--text-muted)]">
              <li>• New artisan sign-up requests</li>
              <li>• Low-stock alerts on popular crafts</li>
              <li>• Upcoming workshops or mentoring sessions</li>
            </ul>
            <p className="mt-4 text-[0.7rem] text-[color:var(--text-muted)]">
              For now, it serves as a design placeholder to show how the admin
              tools can continue to grow with JB DABS.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
