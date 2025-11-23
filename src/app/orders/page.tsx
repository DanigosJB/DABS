"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.push("/");
          return;
        }

        const userData = userSnap.data();

        // only BUYERS can access My Orders
        if (userData.role !== "buyer") {
          router.push("/");
          return;
        }

        const ordersRef = collection(db, "orders");
        const snap = await getDocs(ordersRef);

        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setOrders(list);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  /* ---------- helpers ---------- */

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 border border-amber-200",
    processing: "bg-blue-50 text-blue-800 border border-blue-200",
    shipped: "bg-sky-50 text-sky-800 border border-sky-200",
    delivered: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    cancelled: "bg-red-50 text-red-800 border border-red-200",
  };

  const prettyStatus = (status?: string) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => (o.status || "pending") === statusFilter);

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-main)] flex items-center justify-center">
        <p className="text-sm text-[color:var(--text-muted)]">
          Loading your orders…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER + FILTERS */}
        <section className="flex flex-col gap-4 border-b border-[color:var(--border-soft)] pb-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
              My orders
            </p>
            <h1 className="font-display text-2xl text-[color:var(--text-main)] md:text-3xl">
              Track your purchases
            </h1>
            <p className="text-xs text-[color:var(--text-muted)] md:text-sm">
              View your orders from artisan sellers and follow their status.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 text-xs md:text-[0.8rem]">
            <div className="inline-flex items-center rounded-full bg-[color:var(--bg-card)] px-1 py-1 border border-[color:var(--border-soft)]">
              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "processing", label: "Processing" },
                { key: "shipped", label: "Shipped" },
                { key: "delivered", label: "Delivered" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-3 py-1 rounded-full transition text-xs md:text-[0.8rem] ${
                    statusFilter === filter.key
                      ? "bg-[color:var(--accent-primary)] text-white shadow-sm"
                      : "text-[color:var(--text-muted)] hover:bg-[color:var(--bg-main)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* NO ORDERS */}
        {filteredOrders.length === 0 && (
          <section className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-6 py-10 text-center shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-[color:var(--text-muted)] mb-4">
              You don&apos;t have any orders yet.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-teal)] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              Browse marketplace
            </Link>
          </section>
        )}

        {/* ORDER LIST */}
        {filteredOrders.length > 0 && (
          <section className="space-y-4">
            {filteredOrders.map((order) => {
              const status = order.status || "pending";
              const badge =
                statusStyles[status] ||
                "bg-[color:var(--bg-card)] text-[color:var(--text-main)] border border-[color:var(--border-soft)]";

              let dateString = "Date not available";
              if (order.createdAt?.toDate) {
                const d = order.createdAt.toDate();
                dateString = d.toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }

              const total =
                typeof order.totalAmount === "number"
                  ? order.totalAmount
                  : 0;

              // your current items format: ["Painting", 1250, 1, "Aling Marie"]
              const rawItems = order.items || [];
              const itemObject =
                Array.isArray(rawItems) && rawItems.length >= 4
                  ? {
                      productName: rawItems[0],
                      price: rawItems[1],
                      quantity: rawItems[2],
                      sellerName: rawItems[3],
                    }
                  : null;

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
                >
                  {/* TOP ROW */}
                  <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                        Order ID #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-[color:var(--text-main)]">
                        Placed on{" "}
                        <span className="font-medium">{dateString}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-medium ${badge}`}
                      >
                        {prettyStatus(status)}
                      </span>
                      <p className="text-sm font-semibold text-[color:var(--text-main)]">
                        ₱{total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="mt-2 border-t border-[color:var(--border-soft)] pt-3">
                    {itemObject ? (
                      <div className="flex flex-col justify-between gap-1 text-sm text-[color:var(--text-main)] md:flex-row">
                        <div>
                          <p className="font-medium">
                            {itemObject.productName}
                          </p>
                          <p className="text-[0.75rem] text-[color:var(--text-muted)]">
                            by {itemObject.sellerName}
                          </p>
                        </div>
                        <p className="text-sm text-[color:var(--text-main)]">
                          {itemObject.quantity} × ₱
                          {Number(itemObject.price || 0).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[color:var(--text-muted)]">
                        Order items not available.
                      </p>
                    )}
                  </div>

                  {/* BOTTOM ROW */}
                  <div className="mt-4 flex flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between md:text-[0.8rem]">
                    <div className="space-y-1 text-[color:var(--text-muted)]">
                      {order.shippingAddress && (
                        <p>
                          Shipping to{" "}
                          <span className="text-[color:var(--text-main)]">
                            {order.shippingAddress}
                          </span>
                        </p>
                      )}
                      {order.paymentMethod && (
                        <p>
                          Payment method{" "}
                          <span className="text-[color:var(--text-main)]">
                            {order.paymentMethod}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-[0.78rem] font-medium text-[color:var(--text-main)] hover:bg-[color:var(--bg-main)]"
                      >
                        View details
                      </button>
                      {status === "delivered" && (
                        <button
                          type="button"
                          className="rounded-full bg-[color:var(--accent-primary)] px-3 py-1 text-[0.78rem] font-semibold text-white hover:brightness-95"
                        >
                          Rate order
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
