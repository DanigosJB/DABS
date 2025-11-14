export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFF7EF] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <section className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">
            About Designers of Artful Brush-Strokes (DABS)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">
            Empowering women artisans in Baguio&apos;s Cordillera region through
            digital innovation, financial education, and community support.
          </p>
        </section>

        {/* IMAGE + MISSION */}
        <section className="grid gap-8 md:grid-cols-2 items-start mb-14">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl shadow-sm border border-orange-100 bg-slate-200">
            {/* Replace /about-weaving.jpg with any image in your public/ folder */}
            <img
              src="/about-weaving.jpg"
              alt="Colorful woven textiles from the Cordillera region"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mission text */}
          <div className="space-y-4 text-sm sm:text-base text-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              Our Mission
            </h2>
            <p>
              DABS is dedicated to preserving traditional
              craftsmanship while equipping artisan women with modern digital
              tools and business skills. We bridge the gap between cultural
              heritage and contemporary markets.
            </p>
            <p>
              Based in Baguio City, we work with cooperatives like Cordillera
              Weavers, Mountain Crafts, and local craft shops to provide a
              comprehensive platform for growth and sustainability.
            </p>
            <p>
              Through our e-commerce marketplace, educational workshops, peer
              mentoring, and analytics tools, we help artisans increase their
              income and reach customers worldwide.
            </p>
          </div>
        </section>

        {/* WHAT WE OFFER */}
        <section>
          <h2 className="text-center text-sm font-semibold tracking-wide text-slate-500 mb-6">
            What We Offer
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                🛒
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                E-Commerce Marketplace
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Sell eco-friendly crafts to customers around the world through
                a curated online marketplace made for artisan products.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                📚
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                Financial Literacy Workshops
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Learn budgeting, pricing strategies, tax basics, and financial
                planning tailored for small craft businesses.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                🤝
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                Peer Mentoring Program
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Connect with experienced artisans and business coaches for
                one-on-one guidance and support as you grow your craft
                business.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                📊
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                Sales Analytics
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Track performance with simple analytics that show sales trends,
                popular products, and customer insights.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                📣
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                Digital Marketing Tools
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Learn how to promote your products online using social media,
                content marketing, and storytelling around your craft.
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                🌱
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                Community Support
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Join a supportive community of women artisans to share
                knowledge, celebrate wins, and help each other overcome
                challenges.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
