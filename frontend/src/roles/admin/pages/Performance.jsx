import toast from "react-hot-toast";

export default function Performance({ setActiveTab }) {
  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  // Weekly activity mockup heights (percent of chart area)
  const weeklyData = [
    { day: "Mon", height: "82%" },
    { day: "Tue", height: "85%" },
    { day: "Wed", height: "82%" },
    { day: "Thu", height: "83%" },
    { day: "Fri", height: "83%" },
    { day: "Sat", height: "72%" },
    { day: "Sun", height: "60%" },
  ];

  // Monthly growth trend heights (percent of chart area)
  const monthlyData = [
    { month: "Jan", height: "55%" },
    { month: "Feb", height: "48%" },
    { month: "Mar", height: "62%" },
    { month: "Apr", height: "53%" },
    { month: "May", height: "40%" },
    { month: "Jun", height: "35%" },
    { month: "Jul", height: "32%" },
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
            className="text-sm font-semibold text-heading relative py-2 border-b-2 border-secondary cursor-pointer bg-transparent border-none"
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab?.("about")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 bg-transparent border-none cursor-pointer text-left"
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

      <section className="bg-white py-12 px-8 border-b border-border-custom text-center">
        <div className="max-w-6xl mx-auto space-y-3 flex flex-col items-center">
          <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
            Analytics Dashboard
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-secondary font-display tracking-tight leading-none">
            Fleet Performance
          </h2>
          <p className="text-sm md:text-base text-body font-medium max-w-2xl leading-relaxed text-center">
            Live insights across your entire fleet. Track efficiency, safety, fuel consumption, and driver behavior at scale.
          </p>
        </div>
      </section>

      {/* 3. Analytics Cards Row */}
      <section className="py-10 px-8 bg-bg-page">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Organizations */}
          <div className="bg-[#FFDBCC] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-36 md:h-40">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-body uppercase tracking-wider font-display">Total Organizations</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-auto space-y-0.5">
              <span className="text-3xl font-extrabold font-display text-heading tracking-tight">1,284</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span>+8.4% vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Fleet Managers */}
          <div className="bg-[#FFDBCC] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-36 md:h-40">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-body uppercase tracking-wider font-display">Fleet Managers</span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-auto space-y-0.5">
              <span className="text-3xl font-extrabold font-display text-heading tracking-tight">347</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span>+12 vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 3: Platform Uptime */}
          <div className="bg-[#FFDBCC] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-36 md:h-40">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-body uppercase tracking-wider font-display">Platform Uptime</span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-auto space-y-0.5">
              <span className="text-3xl font-extrabold font-display text-heading tracking-tight">99.8%</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span>+0.2% vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Org Satisfaction */}
          <div className="bg-[#FFDBCC] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-36 md:h-40">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-body uppercase tracking-wider font-display">Org Satisfaction</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-auto space-y-0.5">
              <span className="text-3xl font-extrabold font-display text-heading tracking-tight">94.2%</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span>+2.1% vs last month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Charts Block */}
      <section className="pb-16 px-8 bg-bg-page">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Card 5: Weekly Platform Activity (Full Width) */}
          <div className="bg-white rounded-3xl border border-border-custom p-8 space-y-8 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-heading text-lg">Weekly Platform Activity</h3>
              <p className="text-xs text-body">Active vs suspended vs inactive organizations</p>
            </div>

            {/* Custom Responsive Column Bar Chart */}
            <div className="relative h-64 w-full flex items-end justify-between pt-6 border-b border-border-custom/80 pb-2">
              {/* Y-Axis lines */}
              <div className="absolute inset-x-0 top-0 bottom-2 flex flex-col justify-between pointer-events-none text-[9px] text-muted font-bold font-display">
                <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>1250</span></div>
                <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>1000</span></div>
                <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>750</span></div>
                <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>500</span></div>
                <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>250</span></div>
                <div className="w-full pt-1"><span>0</span></div>
              </div>

              {/* Bars container */}
              <div className="relative z-10 w-full h-full flex items-end justify-around px-8">
                {weeklyData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer w-12">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-[9px] font-bold shadow-md z-20 pointer-events-none">
                      {item.height === "85%" ? "1,080 Active" : "950 Active"}
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: item.height }}
                      className="w-4.5 rounded-t-lg bg-secondary transition-all duration-500 group-hover:brightness-95 shadow-sm"
                    />
                    {/* Day label */}
                    <span className="text-[10px] font-semibold text-body">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid for Organization Growth and Donut Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Card: Organization Growth Trend */}
            <div className="bg-white rounded-3xl border border-border-custom p-8 space-y-8 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-heading text-lg">Organization Growth Trend</h3>
                  <p className="text-xs text-body">Monthly new organizations onboarded</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  +18% YTD
                </span>
              </div>

              {/* Custom Column Bar Chart */}
              <div className="relative h-64 w-full flex items-end justify-between pt-6 border-b border-border-custom/80 pb-2">
                {/* Y-Axis lines */}
                <div className="absolute inset-x-0 top-0 bottom-2 flex flex-col justify-between pointer-events-none text-[9px] text-muted font-bold font-display">
                  <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>200</span></div>
                  <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>150</span></div>
                  <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>100</span></div>
                  <div className="w-full border-t border-dashed border-border-custom flex justify-between pt-1"><span>50</span></div>
                  <div className="w-full pt-1"><span>0</span></div>
                </div>

                {/* Bars container */}
                <div className="relative z-10 w-full h-full flex items-end justify-around px-4">
                  {monthlyData.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer w-10">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-[9px] font-bold shadow-md z-20 pointer-events-none">
                        {item.height} Onboarded
                      </div>
                      {/* Bar */}
                      <div
                        style={{ height: item.height }}
                        className="w-4 rounded-t-md bg-secondary transition-all duration-500 group-hover:brightness-95 shadow-sm"
                      />
                      {/* Month label */}
                      <span className="text-[10px] font-semibold text-body">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card: Organization Status Donut */}
            <div className="bg-white rounded-3xl border border-border-custom p-8 space-y-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-heading text-lg">Organization Status</h3>
                <p className="text-xs text-body">Current organization distribution</p>
              </div>

              {/* Donut Chart representation */}
              <div className="flex items-center justify-center py-4">
                <div className="relative h-44 w-44">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F3F4F6" strokeWidth="3" />

                    {/* Active Slice (Emerald) - 85% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="3"
                      strokeDasharray="85 15"
                      strokeDashoffset="0"
                    />

                    {/* Suspended Slice (Amber) - 11% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="3"
                      strokeDasharray="11 89"
                      strokeDashoffset="-85"
                    />

                    {/* Inactive Slice (Crimson) - 4% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="3"
                      strokeDasharray="4 96"
                      strokeDashoffset="-96"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
                    <span className="text-2xl font-black text-heading">1,284</span>
                    <span className="text-[9px] text-muted font-bold tracking-wider uppercase">Total Orgs</span>
                  </div>
                </div>
              </div>

              {/* Legend details */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                    <span className="text-body font-medium">Active</span>
                  </div>
                  <span className="text-heading font-bold">1,089</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
                    <span className="text-body font-medium">Suspended</span>
                  </div>
                  <span className="text-heading font-bold">142</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                    <span className="text-body font-medium">Inactive</span>
                  </div>
                  <span className="text-heading font-bold">53</span>
                </div>
              </div>
            </div>
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
