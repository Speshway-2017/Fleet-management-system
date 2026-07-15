/**
 * AuthLayout — shared auth page shell
 * LEFT  : Fixed sticky panel with brand info, stats cards, and features bar
 * RIGHT : Scrollable form content
 */
export default function AuthLayout({ children, backLabel, onBack }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] font-sans relative">

      {/* ══ LEFT PANEL / MOBILE BACKGROUND ══ */}
      <div
        className="absolute inset-0 z-0 lg:relative lg:inset-auto lg:flex lg:w-[45%] lg:min-w-[460px] flex-shrink-0 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between overflow-hidden bg-cover bg-center px-8 py-8"
        style={{
          backgroundImage:
            "url('/hero-bg.jpg')",
        }}
      >
        {/* Soft dark overlay for text readability while maintaining high image clarity */}
        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none z-0" />

        {/* ── TOP: Brand & Description Zone ── */}
        <div className="relative z-10 space-y-6">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center h-10 w-10">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="font-display font-black text-white text-sm tracking-wide">
              Fleet Management
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-white leading-tight tracking-tight text-3xl sm:text-4xl">
            Fleet Management <br />
            <span className="text-[#A14000]">System</span>
          </h1>

          {/* Description */}
          <p className="text-slate-200 font-medium leading-relaxed text-xs max-w-sm">
            Manage your fleet operations efficiently with real-time telematics, driver performance tracking, and automated maintenance scheduling.
          </p>

          {/* Stats Badges */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {/* Stat 1 */}
            <div className="flex items-center gap-3.5 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-3.5 shadow-sm min-w-[160px]">
              <div className="h-9 w-9 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-[#0B1B3D] leading-none">99.9%</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Uptime</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3.5 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-3.5 shadow-sm min-w-[160px]">
              <div className="h-9 w-9 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a2 2 0 00-2-2h-6M21 16H9m12 0h-2m-2 0h-5m-9 0H3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-[#0B1B3D] leading-none">15k+</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Vehicles</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: Translucent Highlights Bar ── */}
        <div className="relative z-10 w-full mt-auto">
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-[#A14000]">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h5 className="text-[10px] font-bold text-white tracking-wide">Secure & Reliable</h5>
              <p className="text-[9px] text-gray-300 leading-tight">Enterprise-grade security to keep your data safe.</p>
            </div>

            <div className="space-y-1">
              <div className="text-[#A14000]">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5 className="text-[10px] font-bold text-white tracking-wide">Real-time Insights</h5>
              <p className="text-[9px] text-gray-300 leading-tight">Make faster, smarter decisions every day.</p>
            </div>

            <div className="space-y-1">
              <div className="text-[#A14000]">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h5 className="text-[10px] font-bold text-white tracking-wide">24/7 Support</h5>
              <p className="text-[9px] text-gray-300 leading-tight">Our team is always here when you need us.</p>
            </div>
          </div>
        </div>
      </div>
      {/* ══ END LEFT PANEL ══ */}

      {/* ══ RIGHT PANEL / MOBILE OVERLAY FORM ══ */}
      <div className="relative z-10 flex-1 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-10 bg-transparent lg:bg-[#F8FAFC] overflow-y-auto w-full">
        {/* Form card */}
        <div className="w-full max-w-[440px] bg-white border border-gray-200 lg:border-border-custom rounded-3xl px-6 sm:px-8 py-8 shadow-xl lg:shadow-sm">
          {/* Back navigation (inside form) */}
          {backLabel && onBack && (
            <div className="mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-xs font-bold text-[#A14000] hover:text-[#853500] transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {backLabel}
              </button>
            </div>
          )}

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
