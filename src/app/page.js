import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF7EF] text-slate-900">

      {/* HERO + IMAGE */}
      <section className="px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Left: Text */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-orange-500 mb-4">
            BAGUIO • CORDILLERA
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Empowering{" "}
            <span className="text-orange-600">Artisan Women</span> in the
            Cordillera
          </h1>

          <p className="text-slate-600 mb-6 max-w-xl">
            Join our digital platform connecting Cordillera women artisans with
            global markets. Access marketing tools, financial literacy
            workshops, and peer mentoring to grow your craft business.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <button className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700">
              Start Your Journey
            </button>

            <Link
              href="/marketplace"
              className="rounded-full border border-orange-600 px-6 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 inline-flex items-center justify-center"
            >
              Explore Marketplace
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10 text-sm">
            <div>
              <p className="text-xl font-bold text-orange-600">150+</p>
              <p className="text-slate-500">Active Artisans</p>
            </div>
            <div>
              <p className="text-xl font-bold text-orange-600">5000+</p>
              <p className="text-slate-500">Crafts Sold</p>
            </div>
            <div>
              <p className="text-xl font-bold text-orange-600">₱2.5M</p>
              <p className="text-slate-500">Total Sales</p>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-slate-200 h-[260px] md:h-[320px]">
          {/* Placeholder image */}
        </div>

      </section>
    </main>
  );
}
