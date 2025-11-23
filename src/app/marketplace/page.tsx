"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type ProductCategory = "Jewelry" | "Textiles" | "Homeware" | "Accessories";

type Product = {
  id: string;
  name: string;
  artisan: string;
  price: number;
  tag: ProductCategory;
  location: string;
  highlight?: string;
};

type Role = "buyer" | "artisan" | "admin" | null;

const allProducts: Product[] = [
  {
    id: "1",
    name: "Handwoven Ifugao Table Runner",
    artisan: "Luna Loom Studio",
    price: 1850,
    tag: "Textiles",
    location: "Baguio, Benguet",
    highlight: "Ifugao-inspired geometric weave",
  },
  {
    id: "2",
    name: "Recycled Brass Sun Necklace",
    artisan: "Siklo Jewelry",
    price: 920,
    tag: "Jewelry",
    location: "Quezon City",
    highlight: "Upcycled brass with hand-hammered finish",
  },
  {
    id: "3",
    name: "Coconut Shell Candle Holder",
    artisan: "Isla Home",
    price: 640,
    tag: "Homeware",
    location: "Cebu City",
    highlight: "Hand-cut coconut shell with tealight insert",
  },
  {
    id: "4",
    name: "Hand-painted Market Tote",
    artisan: "Studio Tinta",
    price: 780,
    tag: "Accessories",
    location: "Manila",
    highlight: "Water-based inks on organic canvas",
  },
  {
    id: "5",
    name: "Woven Abaca Plant Basket",
    artisan: "Cordillera Craft Co.",
    price: 1290,
    tag: "Homeware",
    location: "La Trinidad",
    highlight: "Abaca rope with hand-dyed teal accents",
  },
  {
    id: "6",
    name: "Shell & Bead Dangle Earrings",
    artisan: "Isla Home",
    price: 520,
    tag: "Jewelry",
    location: "Cebu City",
    highlight: "Lightweight, hypoallergenic hooks",
  },
];

const categories: (ProductCategory | "All")[] = [
  "All",
  "Jewelry",
  "Textiles",
  "Homeware",
  "Accessories",
];

type SortOption = "new" | "price-asc" | "price-desc";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(ProductCategory | "All")>("All");
  const [sort, setSort] = useState<SortOption>("new");

  // auth + role
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);

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

  const canAddCraft = !roleLoading && role === "artisan" && !!user;

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (category !== "All") {
      products = products.filter((p) => p.tag === category);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.artisan.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    if (sort === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else {
      // "new" – keep default order
    }

    return products;
  }, [search, category, sort]);

  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] pb-16">
      {/* TOP BAR / TITLE */}
      <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-main)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-teal)]">
              Marketplace
            </p>
            <h1 className="font-display text-2xl md:text-3xl">
              Discover pieces from{" "}
              <span className="underline decoration-[color:var(--accent-primary)] decoration-[0.3em] underline-offset-[0.18em]">
                independent artisans
              </span>
            </h1>
            <p className="max-w-xl text-xs text-[color:var(--text-muted)] md:text-sm">
              Browse curated, small-batch items from student makers and
              community artisans across the Philippines.
            </p>
          </div>

          {/* Quick stats + Add button */}
          <div className="flex flex-col items-start gap-3 text-[0.7rem] text-[color:var(--text-muted)] md:items-end md:text-xs">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/70 px-3 py-1">
                6 sample listings
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1">
                Ethically made
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1">
                Supporting artisan women
              </span>
            </div>

            {canAddCraft && (
              <Link
                href="/marketplace/new"
                className="rounded-full bg-[color:var(--accent-primary)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white shadow-sm hover:brightness-95"
              >
                Add new craft
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-card)]/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="flex w-full items-center gap-2 md:max-w-md">
            <div className="flex flex-1 items-center rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-xs">
              <input
                type="text"
                placeholder="Search by item, artisan, or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-[0.8rem] text-[color:var(--text-main)] outline-none placeholder:text-[color:var(--text-muted)]"
              />
            </div>
          </div>

          {/* Filters + count */}
          <div className="flex flex-wrap items-center gap-3 text-[0.7rem] md:text-xs">
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ProductCategory | "All")
              }
              className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[0.75rem] text-[color:var(--text-main)] outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All categories" : cat}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[0.75rem] text-[color:var(--text-main)] outline-none"
            >
              <option value="new">Newest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <span className="hidden rounded-full bg-[color:var(--accent-primary)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white md:inline-flex">
              {filteredProducts.length} items
            </span>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        {filteredProducts.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-[color:var(--border-soft)] bg-[color:var(--bg-card)]/80 px-6 py-10 text-center">
            <p className="text-sm text-[color:var(--text-muted)]">
              No items match your search yet. Try adjusting your filters or
              checking back soon for new pieces.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <MarketplaceCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Tiny note */}
        <p className="mt-6 text-center text-[0.7rem] text-[color:var(--text-muted)]">
          These are sample listings for layout only — connect Firestore here to
          show real products from your artisans.
        </p>
      </section>
    </main>
  );
}

function MarketplaceCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] shadow-[0_10px_26px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.16)]"
    >
      {/* Image / color block */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="h-full w-full bg-gradient-to-br from-[color:var(--accent-teal)] via-[color:var(--bg-main)] to-[color:var(--accent-primary)]" />
        <div className="absolute inset-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/85 px-3 py-1 text-[0.65rem] font-medium text-[color:var(--accent-teal)] backdrop-blur">
            {product.tag}
          </span>
          <span className="rounded-full bg-[color:var(--accent-primary)]/95 px-3 py-1 text-[0.65rem] font-semibold text-white">
            ₱{product.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-[color:var(--text-main)]">
          {product.name}
        </h3>
        <p className="text-xs text-[color:var(--text-muted)]">
          {product.artisan} • {product.location}
        </p>
        {product.highlight && (
          <p className="text-[0.7rem] text-[color:var(--text-muted)]">
            {product.highlight}
          </p>
        )}

        <button className="mt-auto inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-teal)] transition group-hover:bg-[color:var(--accent-teal)] group-hover:text-white">
          View details
        </button>
      </div>
    </Link>
  );
}
