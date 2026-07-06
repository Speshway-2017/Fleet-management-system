/**
 * AuthLayout — shared auth page shell
 * LEFT  : Fixed sticky panel split into text zone (top) + truck image (bottom)
 * RIGHT : Scrollable form content
 */
export default function AuthLayout({ children, backLabel, onBack }) {
  return (
    <div className="min-h-screen flex flex-row bg-[#F5F5F5] font-sans">

      {/* ══ LEFT PANEL ══ */}
      <div
        className="hidden lg:flex w-[42%] flex-shrink-0 sticky top-0 h-screen flex-col justify-between overflow-hidden relative bg-cover bg-center"
        style={{
          minWidth: "380px",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=1418&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        {/* Translucent overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-none" />

        {/* ── TOP: text content area ── */}
        <div className="relative z-10 flex flex-col px-8 pt-8 pb-4 flex-shrink-0">
          {/* Logo + brand */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center h-10 w-10 flex-shrink-0">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-wide">
              Fleet Management
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-extrabold text-[#A14000] leading-tight tracking-tight text-[22px] mb-2">
            Fleet Management <br />System
          </h1>

          {/* Description */}
          <p className="text-gray-800 font-medium leading-relaxed text-[12px] max-w-[260px] mb-4">
            Manage your fleet operations efficiently with real-time telematics,
            driver performance tracking, and automated maintenance scheduling.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div className="text-xl font-black text-[#A14000]">99.9%</div>
              <div className="text-[8px] font-extrabold text-[#A14000] tracking-widest uppercase">Uptime</div>
            </div>
            <div>
              <div className="text-xl font-black text-[#A14000]">15k+</div>
              <div className="text-[8px] font-extrabold text-[#A14000] tracking-widest uppercase">Vehicles</div>
            </div>
          </div>
        </div>

      </div>
      {/* ══ END LEFT PANEL ══ */}

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-10 bg-[#F5F5F5] overflow-y-auto">

        {/* Back navigation */}
        {backLabel && onBack && (
          <div className="w-full max-w-[420px] mb-4">
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

        {/* Form card */}
        <div className="w-full max-w-[420px] bg-white border border-[#A14000]/30 rounded-2xl px-5 sm:px-8 py-6 sm:py-8 shadow-sm">

          {/* Centered logo */}
          <div className="flex justify-center mb-5">
            <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 flex items-center justify-center h-14 w-14">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-10 w-10 object-contain" />
            </div>
          </div>

          {/* Route-specific form */}
          {children}

        </div>
      </div>

    </div>
  );
}
