import Link from "next/link";

type InfoCardProps = {
  title: string;
  body: string;
  href: string;
};

type Product = {
  id: string;
  name: string;
  artisan: string;
  price: number;
  tag: string;
};

const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Handwoven Ifugao Table Runner",
    artisan: "Luna Loom Studio · Baguio",
    price: 1850,
    tag: "Textiles",
  },
  {
    id: "2",
    name: "Recycled Brass Sun Necklace",
    artisan: "Siklo Jewelry · QC",
    price: 920,
    tag: "Jewelry",
  },
  {
    id: "3",
    name: "Coconut Shell Candle Holder",
    artisan: "Isla Home · Cebu",
    price: 640,
    tag: "Homeware",
  },
  {
    id: "4",
    name: "Hand-painted Tote Bag",
    artisan: "Studio Tinta · Manila",
    price: 780,
    tag: "Accessories",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen pb-24">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[color:var(--border-soft)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-20 lg:py-24">
          {/* Left text */}
          <div className="md:w-1/2 space-y-6">
            {/* yellow pill */}
            <p className="inline-flex items-center rounded-full border border-[color:var(--accent-primary)] bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[color:var(--accent-primary)]">
              New · Handcrafted marketplace
            </p>

            <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Handcrafted pieces,{" "}
              <span className="underline decoration-[color:var(--accent-primary)] decoration-[0.35em] underline-offset-[0.25em]">
                made close to home
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-[color:var(--text-muted)] md:text-base">
              Discover artisans from across the Philippines creating jewelry,
              textiles, homeware, and more. Every piece in JB DABS carries a
              story, not just a price tag.
            </p>

            <div className="flex flex-wrap gap-3">
              {/* teal primary CTA */}
              <Link
                href="/browse"
                className="rounded-full bg-[color:var(--accent-teal)] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition"
              >
                Shop artisans
              </Link>

              {/* yellow secondary CTA */}
              <Link
                href="/signup-artisan"
                className="rounded-full bg-[color:var(--accent-primary)] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition"
              >
                Become a seller
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 text-xs text-[color:var(--text-muted)]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-primary)]" />
                Curated, small-batch pieces
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-secondary)]" />
                Fair, transparent pricing
              </div>
            </div>
          </div>

          {/* Right image card / hero mock */}
          <div className="md:w-1/2">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent" />
              {/* Placeholder for now – you can replace with <Image> */}
              <div className="flex h-full flex-col justify-between p-6">
                <div className="space-y-2 text-xs uppercase tracking-[0.18em] text-[color:var(--accent-teal)]">
                  <p>Featured artisan</p>
                  <p className="font-medium text-[color:var(--text-main)]">
                    Kalinga Woven Textiles Co.
                  </p>
                </div>

                <div className="space-y-3 rounded-3xl bg-white/85 p-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[color:var(--text-muted)]">
                        Just added
                      </p>
                      <p className="font-medium text-sm">
                        Handwoven Abaca Tote
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[color:var(--accent-secondary)]">
                      ₱1,850
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-[color:var(--text-muted)]">
                    Sustainably made in small batches, with patterns inspired by
                    Cordilleran heritage.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-[color:var(--text-muted)]">
              Product images are placeholders — replace with your own artisan
              photos.
            </p>
          </div>
        </div>
      </section>

      {/* RIBBON / NEW ARRIVALS */}
      <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-card)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-4 text-xs text-[color:var(--text-muted)] md:flex-row">
          <p className="uppercase tracking-[0.18em]">
            New arrivals added{" "}
            <span className="font-semibold text-[color:var(--accent-teal)]">
              weekly
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-3 py-1">
              Jewelry
            </span>
            <span className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-3 py-1">
              Textiles
            </span>
            <span className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-3 py-1">
              Homeware
            </span>
            <span className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-3 py-1">
              Accessories
            </span>
          </div>
        </div>
      </section>

      {/* “NEW TO HANDMADE?” SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr,1fr] md:items-start">
          <div className="space-y-4">
            <h2 className="font-display text-2xl md:text-3xl">
              New to{" "}
              <span className="underline decoration-[color:var(--accent-teal)] decoration-[0.3em] underline-offset-[0.18em]">
                handmade markets?
              </span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[color:var(--text-muted)]">
              We connect you with independent makers so you can shop ethically
              and locally—even when you’re online. Learn how JB DABS works,
              whether you’re here to discover new favorites or to sell your
              craft.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard
                title="Start here"
                body="See how to browse collections, save favorites, and message artisans."
                href="/how-it-works"
              />
              <InfoCard
                title="For buyers"
                body="Tips for choosing the right size, material, and care instructions."
                href="/buyers"
              />
              <InfoCard
                title="For artisans"
                body="Apply to join, set up your shop, and publish your first product."
                href="/artisans"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
              As seen in spirit
            </p>
            <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">
              “Digital marketplaces like JB DABS make it easier for
              student-artisans and local makers to be discovered, without the
              cost of a physical store.”
            </p>
            <p className="text-xs font-medium text-[color:var(--accent-teal)]">
              — Campus Creatives, 2025
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID – FRESH FROM THE WORKSHOP */}
      <section className="mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl">
              Fresh from the <span className="italic">workshop</span>
            </h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              A rotating selection of newly added pieces from verified artisans.
            </p>
          </div>
          <Link
            href="/browse?sort=new"
            className="hidden text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--accent-teal)] md:inline-flex"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dummyProducts.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-[color:var(--accent-teal)]/30 via-[color:var(--bg-main)] to-[color:var(--accent-primary)]/45" />
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-medium text-[color:var(--accent-teal)] backdrop-blur">
                    {product.tag}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-xs text-[color:var(--text-muted)]">
                  {product.artisan}
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--accent-secondary)]">
                  ₱{product.price.toLocaleString()}
                </p>
                <button className="mt-auto inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--accent-teal)] transition group-hover:bg-[color:var(--accent-teal)] group-hover:text-white">
                  View piece
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/browse?sort=new"
            className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--accent-teal)]"
          >
            View all &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, body, href }: InfoCardProps) {
  return (
    <Link
      href={href}
      className="flex h-full flex-col justify-between rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(59,38,27,0.12)]"
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs leading-relaxed text-[color:var(--text-muted)]">
          {body}
        </p>
      </div>

      <span className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Learn more &rarr;
      </span>
    </Link>
  );
}
