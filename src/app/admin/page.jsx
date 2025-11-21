"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [pendingOrders, setPendingOrders] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

  const [recentOrders, setRecentOrders] = useState([]);

  // Check auth + role
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
    // Load crafts
    const craftsSnap = await getDocs(collection(db, "crafts"));
    const crafts = craftsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // "Active listings": all crafts, or only those not archived
    const active = crafts.filter((c) => c.status !== "archived").length;
    setActiveListings(active);

    // Load orders
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Pending orders count
    const pending = orders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;
    setPendingOrders(pending);

    // This month revenue
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let revenue = 0;
    orders.forEach((o) => {
      const amount =
        typeof o.totalAmount === "number" ? o.totalAmount : 0;

      if (o.createdAt && typeof o.createdAt.toDate === "function") {
        const d = o.createdAt.toDate();
        if (
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        ) {
          revenue += amount;
        }
      }
    });
    setMonthRevenue(revenue);

    // Recent orders (latest 5 by createdAt)
    const sorted = [...orders].sort((a, b) => {
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

  const formatCurrency = (value) => {
    const num = typeof value === "number" ? value : 0;
    return `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatusBadge = (statusRaw) => {
    const status = (statusRaw || "").toLowerCase();
    let label = status || "unknown";
    let color =
      "bg-slate-100 text-slate-700 border border-slate-200";

    if (status === "pending") {
      label = "pending";
      color =
        "bg-orange-50 text-orange-700 border border-orange-200";
    } else if (status === "completed") {
      label = "completed";
      color =
        "bg-emerald-50 text-emerald-700 border border-emerald-200";
    } else if (status === "processing") {
      label = "processing";
      color =
        "bg-blue-50 text-blue-700 border border-blue-200";
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}
      >
        {label}
      </span>
    );
  };

  const formatDate = (ts) => {
    if (!ts || typeof ts.toDate !== "function") return "";
    const d = ts.toDate();
    return d.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderTitle = (order) => {
    // Handle your items array: [title, price, qty, seller]
    if (Array.isArray(order.items) && order.items.length > 0) {
      const first = order.items[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first.title) return first.title;
    }
    // Any fallback fields
    return order.title || order.craftTitle || "Order";
  };

  const getOrderBuyer = (order) => {
    return (
      order.buyerName ||
      order.buyerEmail ||
      order.buyer ||
      "Buyer"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf4e6] flex items-center justify-center">
        <p className="text-gray-700 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // We already redirected; render nothing
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-700 text-sm">
            Welcome back! Here&apos;s what&apos;s happening on the
            platform.
          </p>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">
                Pending Orders
              </p>
              <span className="text-xs text-orange-500">
                Need attention
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {pendingOrders}
            </p>
          </div>

          {/* Active Listings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">
                Active Listings
              </p>
              <span className="text-xs text-slate-400">
                Products available
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {activeListings}
            </p>
          </div>

          {/* This Month Revenue */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">
                This Month
              </p>
              <span className="text-xs text-emerald-500">
                Platform revenue
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(monthRevenue)}
            </p>
          </div>
        </div>

        {/* Middle row: Recent Orders + Notifications placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">
                Recent Orders
              </p>
              <span className="text-xs text-slate-500">
                Last {recentOrders.length} orders
              </span>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500">
                No orders have been placed yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">
                        {getOrderTitle(order)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getOrderBuyer(order)} • {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {formatStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View all orders button (later you can link to /admin/orders) */}
            <div className="mt-4">
              <button
                className="w-full text-xs text-orange-600 font-semibold py-2 rounded-full border border-orange-200 hover:bg-orange-50"
                type="button"
              >
                View All Orders
              </button>
            </div>
          </div>

          {/* Notifications placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Notifications
            </p>
            <p className="text-xs text-slate-500">
              Notification feeds (new orders, workshop reminders, mentoring
              updates) can be added here for Capstone 2. For now, this
              serves as a design placeholder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
