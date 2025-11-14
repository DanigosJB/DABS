import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF7EF] text-slate-900">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-12 py-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-orange-600">
            DABS
          </span>
          <span className="text-xs text-slate-500">
            Empowering Artisan Women
          </span>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link href="/marketplace" className="hover:text-orange-600">
            Marketplace
          </Link>
          <a href="#workshops" className="hover:text-orange-600">
            Workshops
          </a>
          <a href="#mentoring" className="hover:text-orange-600">
            Mentoring
          </a>
          <a href="#about" className="hover:text-orange-600">
            About
          </a>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <button className="hover:text-orange-600">My Orders</button>
          <button className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 hover:border-orange-500 hover:text-orange-600">
            <span className="inline-block h-6 w-6 rounded-full bg-slate-200" />
            <span>Profile</span>
          </button>
        </div>
      </header>

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

        {/* Right: Image placeholder */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-slate-200 h-[260px] md:h-[320px]">
          {/* Later: replace with real image */}
        </div>
      </section>
    </main>
  );
}
