export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg-main)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* HEADER */}
        <section className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-[color:var(--text-main)] mb-3">
            About Designers of Artful Brush-Strokes (DABS)
          </h1>
          <p className="mx-auto max-w-3xl text-sm sm:text-base leading-relaxed text-[color:var(--text-muted)]">
            Empowering women artisans in Baguio&apos;s Cordillera region through
            digital innovation, financial education, and community support.
          </p>
        </section>

        {/* IMAGE + MISSION */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,1.2fr] items-start">
          {/* Image */}
          <div className="overflow-hidden rounded-[1.75rem] border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
            {/* Replace with any image in /public */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about-weaving.jpg"
              alt="Colorful woven textiles from the Cordillera region"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Mission (revamped) */}
          <div className="rounded-[1.75rem] border border-[color:var(--border-soft)] bg-gradient-to-br from-[color:var(--bg-card)] to-[color:var(--bg-main)] px-6 py-7 md:px-8 md:py-9 shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
            <p className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-teal)]">
              Our mission
            </p>

            <h2 className="mt-4 text-lg sm:text-xl font-semibold text-[color:var(--text-main)]">
              Keeping Cordilleran stories alive while helping artisans thrive.
            </h2>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[color:var(--text-muted)]">
              DABS is dedicated to preserving traditional craftsmanship while
              equipping artisan women with modern digital tools and business
              skills. We bridge the gap between cultural heritage and
              contemporary markets.
            </p>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[color:var(--text-muted)]">
              Based in Baguio City, we collaborate with cooperatives and local
              craft communities to build safe, ethical spaces where artisans can
              experiment, learn, and grow—without having to leave their homes or
              studies.
            </p>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[color:var(--text-muted)]">
              Through our marketplace, workshops, mentoring, and analytics, we
              support artisans in turning their craft into a sustainable source
              of income, without losing the stories woven into every piece.
            </p>

            {/* Key points row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MissionPill>
                Centering Cordilleran voices and design traditions.
              </MissionPill>
              <MissionPill>
                Making digital selling and payments feel less intimidating.
              </MissionPill>
              <MissionPill>
                Building a peer-to-peer support circle instead of competition.
              </MissionPill>
            </div>
          </div>
        </section>

        {/* WHAT WE OFFER */}
        <section className="space-y-6">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            What we offer
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <AboutCard
              icon="🛒"
              title="E-commerce marketplace"
              body="Sell eco-friendly crafts through a curated online marketplace made for artisan products."
            />
            {/* Card 2 */}
            <AboutCard
              icon="📚"
              title="Financial literacy workshops"
              body="Learn budgeting, pricing strategies, tax basics, and financial planning for small craft businesses."
            />
            {/* Card 3 */}
            <AboutCard
              icon="🤝"
              title="Peer mentoring program"
              body="Connect with experienced artisans and business coaches for one-on-one guidance and support."
            />
            {/* Card 4 */}
            <AboutCard
              icon="📊"
              title="Sales analytics"
              body="Track performance with simple analytics that show sales trends, popular products, and customer insights."
            />
            {/* Card 5 */}
            <AboutCard
              icon="📣"
              title="Digital marketing tools"
              body="Learn how to promote your products online with social media, content marketing, and storytelling."
            />
            {/* Card 6 */}
            <AboutCard
              icon="🌱"
              title="Community support"
              body="Join a supportive circle of women artisans to share knowledge, celebrate wins, and face challenges together."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/* Small helper components inside the same file */

function MissionPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-[color:var(--text-main)]">
      <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[color:var(--accent-primary)]" />
      <span>{children}</span>
    </div>
  );
}

function AboutCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-5 shadow-[0_14px_32px_rgba(0,0,0,0.04)]">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--accent-primary)]/15 text-lg">
        <span>{icon}</span>
      </div>
      <h3 className="mb-1 text-sm sm:text-base font-semibold text-[color:var(--text-main)]">
        {title}
      </h3>
      <p className="text-xs sm:text-sm leading-relaxed text-[color:var(--text-muted)]">
        {body}
      </p>
    </div>
  );
}
