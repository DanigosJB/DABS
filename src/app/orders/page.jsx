"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
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
        // load user and role
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.push("/");
          return;
        }

        const userData = userSnap.data();

        // 🔐 only BUYERS can access My Orders
        if (userData.role !== "buyer") {
          router.push("/");
          return;
        }

        // get ALL orders for now (you only have one buyer anyway)
        const ordersRef = collection(db, "orders");
        const snap = await getDocs(ordersRef);

        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        console.log("Loaded orders:", list);
        setOrders(list);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // ---- helpers ----
  const statusStyles = {
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-sky-100 text-sky-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const prettyStatus = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // filter by status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => (o.status || "pending") === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf4e6] flex items-center justify-center">
        <p className="text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Orders
            </h1>
            <p className="text-gray-700">
              Track your purchases from artisan sellers.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "processing", label: "Processing" },
              { key: "shipped", label: "Shipped" },
              { key: "delivered", label: "Delivered" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1 rounded-full border text-xs md:text-sm ${
                  statusFilter === f.key
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* No Orders */}
        {filteredOrders.length === 0 && (
          <div className="bg-white shadow-md rounded-2xl p-8 text-center">
            <p className="text-gray-700 mb-3">
              You don&apos;t have any orders yet.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-orange-600 text-white text-sm hover:bg-orange-700"
            >
              Browse Marketplace
            </Link>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = order.status || "pending";
              const badge =
                statusStyles[status] || "bg-slate-100 text-slate-800";

              // createdAt display
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

              // your items array: ["Painting", 1250, 1, "Aling Marie"]
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
                <div
                  key={order.id}
                  className="bg-white shadow-sm rounded-2xl p-5 border border-slate-100"
                >
                  {/* Top Row */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Order ID #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-700">
                        Placed on{" "}
                        <span className="font-medium">{dateString}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge}`}
                      >
                        {prettyStatus(status)}
                      </span>
                      <p className="text-sm font-semibold text-gray-900">
                        ₱{total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-slate-100 pt-3 mt-2">
                    {itemObject ? (
                      <div className="flex justify-between text-sm text-gray-800">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {itemObject.productName}
                          </span>
                          <span className="text-xs text-gray-500">
                            by {itemObject.sellerName}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {itemObject.quantity} × ₱
                          {Number(itemObject.price || 0).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Order items not available.
                      </p>
                    )}
                  </div>

                  {/* Bottom Row */}
                  <div className="mt-4 flex flex-wrap gap-3 justify-between text-xs md:text-sm">
                    <div className="text-gray-500">
                      {order.shippingAddress && (
                        <p>
                          Shipping to:{" "}
                          <span className="text-gray-700">
                            {order.shippingAddress}
                          </span>
                        </p>
                      )}
                      {order.paymentMethod && (
                        <p>
                          Payment:{" "}
                          <span className="text-gray-700">
                            {order.paymentMethod}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">
                        View Details
                      </button>
                      {status === "delivered" && (
                        <button className="px-3 py-1 rounded-full bg-orange-500 text-white hover:bg-orange-600">
                          Rate Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
