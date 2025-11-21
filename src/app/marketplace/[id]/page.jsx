"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function CraftDetailsPage() {
  // ✅ Get id from useParams instead of props
  const params = useParams();
  const id = params?.id;

  const [craft, setCraft] = useState(null);
  const [loadingCraft, setLoadingCraft] = useState(true);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState(null);

  const router = useRouter();

  // Load craft
  useEffect(() => {
    // id might be undefined on first render
    if (!id) return;

    const loadCraft = async () => {
      try {
        const ref = doc(db, "crafts", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCraft({ id: snap.id, ...snap.data() });
        } else {
          setCraft(null);
        }
      } catch (err) {
        console.error("Error loading craft:", err);
      } finally {
        setLoadingCraft(false);
      }
    };

    loadCraft();
  }, [id]);

  // Load user + role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setLoadingUser(false);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || null);

          // Pre-fill shipping address from profile if present
          if (data.address && !shippingAddress) {
            setShippingAddress(data.address);
          }
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsub();
  }, [shippingAddress]);

  const getImage = () => {
    if (!craft) return null;
    if (craft.imageUrl) return craft.imageUrl;
    if (craft.image) return craft.image;
    if (Array.isArray(craft.images) && craft.images.length > 0) {
      return craft.images[0];
    }
    return null;
  };

  const handlePlaceOrder = async () => {
    setMessage(null);

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "buyer") {
      setMessage({
        type: "error",
        text: "Only buyer accounts can place orders.",
      });
      return;
    }

    if (!craft) return;

    if (!shippingAddress.trim()) {
      setMessage({
        type: "error",
        text: "Please provide a shipping address.",
      });
      return;
    }

    const qty = Number(quantity) || 1;
    const price =
      typeof craft.price === "number" ? craft.price : 0;
    const total = price * qty;

    setPlacingOrder(true);

    try {
      // Match your existing orders structure: ["Painting", 1250, 1, "Aling Marie"]
      const itemsArray = [
        craft.title || craft.name || "Craft",
        price,
        qty,
        craft.sellerName || craft.artisanName || "Artisan",
      ];

      await addDoc(collection(db, "orders"), {
        buyerId: user.uid,
        items: itemsArray,
        totalAmount: total,
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage({
        type: "success",
        text: "Order placed successfully! You can track it in My Orders.",
      });

      setTimeout(() => {
        router.push("/orders");
      }, 1200);
    } catch (err) {
      console.error("Error placing order:", err);
      setMessage({
        type: "error",
        text: "Something went wrong while placing your order. Please try again.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCraft || !id) {
    return (
      <div className="min-h-screen bg-[#fdf4e6] flex items-center justify-center">
        <p className="text-gray-700">Loading craft...</p>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-gray-700 mb-3">
            This craft could not be found.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-orange-600 text-white text-sm hover:bg-orange-700"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const img = getImage();
  const title = craft.title || craft.name || "Handcrafted Item";
  const price =
    typeof craft.price === "number" ? craft.price : 0;
  const seller =
    craft.sellerName || craft.artisanName || "Artisan";
  const location =
    craft.location || craft.city || "Philippines";
  const description =
    craft.description || craft.longDescription || "";

  return (
    <div className="min-h-screen bg-[#fdf4e6] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/marketplace"
          className="text-xs text-orange-600 hover:underline"
        >
          ← Back to Marketplace
        </Link>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {img ? (
              <img
                src={img}
                alt={title}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-orange-50 flex items-center justify-center text-orange-500">
                No Image Available
              </div>
            )}
          </div>

          {/* Details + Order */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {title}
              </h1>
              <p className="text-lg font-bold text-orange-600 mt-2">
                ₱{price.toFixed(2)}
              </p>

              <p className="text-sm text-gray-600 mt-3">
                by <span className="font-medium">{seller}</span>{" "}
                • {location}
              </p>

              {craft.category && (
                <span className="mt-2 inline-flex text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                  {craft.category}
                </span>
              )}

              {description && (
                <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Order panel */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Order this craft
              </h2>

              {message && (
                <div
                  className={`mb-3 px-3 py-2 rounded-lg text-xs ${
                    message.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {loadingUser ? (
                <p className="text-sm text-gray-600">
                  Checking your account…
                </p>
              ) : role !== "buyer" ? (
                <p className="text-sm text-gray-600">
                  You need a{" "}
                  <span className="font-semibold">buyer</span>{" "}
                  account to place orders.
                </p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block mb-1 text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700">
                      Shipping Address
                    </label>
                    <textarea
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) =>
                        setShippingAddress(e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      placeholder="Your delivery address"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="GCash">GCash</option>
                      <option value="Cash on Delivery">
                        Cash on Delivery
                      </option>
                    </select>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="w-full mt-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placingOrder
                      ? "Placing order..."
                      : "Confirm Order"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
