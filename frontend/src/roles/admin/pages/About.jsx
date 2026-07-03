import toast from "react-hot-toast";

export default function About({ setActiveTab }) {
  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const timelineItems = [
    { year: "2018", text: "FleetCommand founded in Austin, TX. Seed funding of $4.2M." },
    { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
    { year: "2021", text: "Series A — $25M. Expanded to fuel analytics and driver scoring." },
    { year: "2023", text: "Surpassed 1M vehicles tracked. Launched predictive maintenance AI." },
    { year: "2026", text: "340+ enterprise clients. $180M+ in documented customer savings." },
  ];

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans">
      {/* 1. Header/Navbar */}
      <header className="bg-white border-b border-border-custom px-8 h-20 flex items-center justify-between sticky top-0 z-30">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img src="/brand-logo.png" alt="Fleet Management Logo" className="h-10 w-auto rounded-lg object-contain" />
          <div>
            <h1 className="font-display font-bold text-secondary tracking-wide text-base">Fleet Management</h1>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setActiveTab("home")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 cursor-pointer bg-transparent border-none"
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 cursor-pointer bg-transparent border-none"
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className="text-sm font-semibold text-heading relative py-2 border-b-2 border-secondary cursor-pointer bg-transparent border-none"
          >
            About
          </button>
          <button
            onClick={() => setActiveTab?.("contact")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 bg-transparent border-none cursor-pointer text-left"
          >
            Contact Us
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleAction("Navbar Login")}
            className="px-5 py-2.5 rounded-xl border border-secondary text-secondary font-semibold text-xs transition-all hover:bg-secondary/5 active:scale-[0.98] cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => handleAction("Navbar Get Started")}
            className="px-5 py-2.5 rounded-xl bg-secondary text-white font-semibold text-xs transition-all hover:bg-accent shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 2. Our Story Section */}
      <section className="py-20 px-8 bg-white border-b border-border-custom">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Story Text */}
          <div className="space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-display text-heading leading-tight tracking-tight">
              Built by Fleet Operators, <br />
              <span className="text-secondary">For Fleet Operators</span>
            </h2>
            <p className="text-sm md:text-base text-body font-medium leading-relaxed">
              FleetCommand was founded in 2018 after our co-founders spent years fighting with disconnected tools, spreadsheets, and reactive maintenance. We built the platform we always wished existed.
            </p>
          </div>

          {/* Right Column: 2x2 Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-6 text-center space-y-1 shadow-sm">
              <span className="text-3xl font-extrabold text-heading font-display block tracking-tight">2018</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Founded</span>
            </div>
            {/* Card 2 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-6 text-center space-y-1 shadow-sm">
              <span className="text-3xl font-extrabold text-heading font-display block tracking-tight">340+</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Enterprises</span>
            </div>
            {/* Card 3 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-6 text-center space-y-1 shadow-sm">
              <span className="text-3xl font-extrabold text-heading font-display block tracking-tight">1.2M+</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Vehicles Tracked</span>
            </div>
            {/* Card 4 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-6 text-center space-y-1 shadow-sm">
              <span className="text-3xl font-extrabold text-heading font-display block tracking-tight">$180M+</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Customer Savings</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Mission Section */}
      <section className="py-20 px-8 bg-bg-page border-b border-border-custom">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Mission Content */}
          <div className="space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-heading tracking-tight leading-tight">
              Eliminating Blind Spots in Fleet Operations
            </h2>
            <div className="space-y-4 text-sm md:text-base text-body font-medium leading-relaxed">
              <p>
                Every year, inefficient fleet management costs businesses billions in wasted fuel, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.
              </p>
              <p>
                FleetCommand gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork.
              </p>
            </div>
            {/* Quote Block */}
            <div className="border-l-4 border-secondary pl-5 italic text-heading font-semibold text-sm md:text-base my-4 max-w-md">
              "The only way to run a fleet well is to see it clearly."
            </div>
          </div>

          {/* Right Column: Attributes List */}
          <div className="space-y-5">
            {/* Item 1 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Total Transparency</h4>
                <p className="text-xs text-body leading-relaxed">
                  We give fleet operators complete visibility — every vehicle, every driver, every mile.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Reliability First</h4>
                <p className="text-xs text-body leading-relaxed">
                  Our 99.97% uptime SLA keeps your operations moving. Never depend on a flaky platform.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Outcome-Driven</h4>
                <p className="text-xs text-body leading-relaxed">
                  We measure our success by your cost savings, not just platform adoption.
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Customer Obsession</h4>
                <p className="text-xs text-body leading-relaxed">
                  Dedicated success managers, 24/7 support, and onboarding that gets you live fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Journey Timeline Section */}
      <section className="py-20 px-8 bg-white border-b border-border-custom text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-2">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Timeline
            </span>
            <h3 className="text-3xl font-extrabold font-display text-heading tracking-tight">
              Our Journey
            </h3>
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-8 text-left border-l border-border-custom pl-8 ml-4 relative">
            {timelineItems.map((item, idx) => (
              <div key={idx} className="relative space-y-1.5 pb-2">
                {/* Timeline Bullet Point */}
                <div className="absolute -left-[37px] top-1.5 h-3.5 w-3.5 rounded-full bg-secondary border-2 border-white shadow-sm" />
                <h4 className="font-display font-extrabold text-sm text-heading tracking-wide">
                  {item.year}
                </h4>
                <p className="text-xs text-body font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer (Dark Background) */}
      <footer className="bg-primary text-gray-300 pt-16 pb-8 px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-800">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/brand-logo.png" alt="Fleet Management Logo" className="h-9 w-auto rounded-lg object-contain bg-white/10 p-0.5" />
              <h4 className="font-display font-bold text-white tracking-wide text-sm">Fleet Management</h4>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              The industry's most trusted fleet management platform. Real-time visibility, intelligent routing, and proactive maintenance.
            </p>
          </div>

          {/* Column 2: PRODUCT */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Product</h5>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><a href="#performance" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Performance"); }} className="hover:text-white transition-colors">Performance</a></li>
              <li><a href="#tracking" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Live Tracking"); }} className="hover:text-white transition-colors">Live Tracking</a></li>
              <li><a href="#analytics" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Fuel Analytics"); }} className="hover:text-white transition-colors">Fuel Analytics</a></li>
              <li><a href="#maintenance" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Maintenance"); }} className="hover:text-white transition-colors">Maintenance</a></li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Company</h5>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - About"); }} className="hover:text-white transition-colors">About</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - Contact"); }} className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#careers" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - Careers"); }} className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#blog" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - Blog"); }} className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Column 4: CONTACT */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Contact</h5>
            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (800) FLEET-01</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 00-2.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hello@fleetcommand.io</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>fleetcommand.io</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted font-medium">
          <div>
            <span>© 2026 FleetCommand Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); handleAction("Privacy Policy"); }} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); handleAction("Terms of Service"); }} className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#cookies" onClick={(e) => { e.preventDefault(); handleAction("Cookie Policy"); }} className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
