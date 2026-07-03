/**
 * AuthLayout — shared auth page shell
 *
 * LEFT  : Exact left panel from Signup1 — never modified.
 * RIGHT : Slot for page-specific form content via `children`.
 *
 * Props:
 *   backLabel  {string}   — text for the back button (optional)
 *   onBack     {function} — click handler for the back button (optional)
 *   children   {ReactNode} — right-side form content
 */
export default function AuthLayout({ children, backLabel, onBack }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F5F5] font-sans">

      {/* ── LEFT PANEL — copied exactly from Signup1, never touch ── */}
      <div className="w-full lg:w-[45%] min-h-[450px] lg:min-h-screen relative overflow-hidden flex flex-col justify-start p-6 lg:p-10 lg:py-12 text-gray-800">

        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-no-repeat bg-bottom z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=2018&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
          }}
        />

        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-black/20 z-10 pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center h-10 w-10">
            <img
              src="/brand-logo.png"
              alt="Fleet Management Logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-display font-bold text-gray-800 text-base tracking-wide">
            Fleet Management
          </span>
        </div>

        {/* Text Block and Stats */}
        <div className="relative z-20 mt-2 lg:mt-3.5 space-y-4 lg:space-y-5">
          <div className="space-y-1.5 lg:space-y-2">
            <h1 className="font-display text-xl lg:text-[26px] font-extrabold text-[#A14000] leading-[1.2] tracking-tight">
              Fleet Management <br />
              System
            </h1>
            <p className="text-[12px] lg:text-[13px] text-gray-700 font-semibold max-w-[280px] leading-relaxed">
              Manage your fleet operations efficiently with real-time telematics, driver performance tracking, and automated maintenance scheduling.
            </p>
          </div>

          {/* Stats Section */}
          <div className="flex gap-8 lg:gap-10 pt-1">
            <div className="space-y-0.5">
              <div className="text-xl lg:text-2xl font-black text-[#A14000] tracking-tight">
                99.9%
              </div>
              <div className="text-[8.5px] font-extrabold text-[#A14000] tracking-wider uppercase">
                UPTIME
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl lg:text-2xl font-black text-[#A14000] tracking-tight">
                15k+
              </div>
              <div className="text-[8.5px] font-extrabold text-[#A14000] tracking-wider uppercase">
                VEHICLES
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── END LEFT PANEL ── */}

      {/* ── RIGHT PANEL — form slot ── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 lg:p-10 bg-[#F5F5F5] min-h-screen relative">

        {/* Back navigation */}
        {backLabel && onBack && (
          <div className="w-full max-w-md mb-4 flex justify-start">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-semibold text-[#A14000] hover:text-[#7d3200] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {backLabel}
            </button>
          </div>
        )}

        {/* Card */}
        <div className="w-full max-w-md bg-white border border-[#A14000]/30 rounded-2xl p-8 lg:p-10 shadow-sm relative z-10">

          {/* Logo centered at top of card */}
          <div className="flex justify-center mb-5">
            <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 flex items-center justify-center h-14 w-14">
              <img
                src="/brand-logo.png"
                alt="Fleet Management Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>

          {/* Route-specific form renders here */}
          {children}

        </div>
      </div>

    </div>
  );
}
