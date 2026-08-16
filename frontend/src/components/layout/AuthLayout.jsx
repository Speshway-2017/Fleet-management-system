import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { platformSettings } = useSettings();

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] font-sans text-[#1E293B] relative overflow-y-auto lg:overflow-hidden">
      
      {/* ── LEFT PANEL (50% Width) ── */}
      <div 
        className="fixed inset-0 z-0 lg:relative lg:inset-auto w-full lg:w-[50%] flex flex-col justify-between p-8 lg:px-14 lg:py-12 [@media(max-height:850px)]:lg:py-8 overflow-hidden bg-cover bg-center h-screen lg:min-h-0 shrink-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
        }}
      >
        {/* Soft dark overlay for text readability while maintaining high image clarity */}
        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none z-0" />
        
        {/* Top Header: Logo + Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={platformSettings?.logoUrl || "/logo.png"} alt="Fleet Management Logo" className="h-10 [@media(max-height:850px)]:h-8 w-auto object-contain bg-white/95 rounded-xl p-1 shadow-sm" />
            <span className="font-display font-black text-white text-lg [@media(max-height:850px)]:text-base tracking-wide">
              {platformSettings?.platformName || "Fleet Management"}
            </span>
          </NavLink>
        </motion.div>

        {/* Middle Hero details */}
        <div className="relative z-10 space-y-7 [@media(max-height:850px)]:space-y-4 max-w-xl my-auto py-12 [@media(max-height:850px)]:py-6">
          
          <motion.h1 
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-display font-black text-white text-3xl sm:text-4xl md:text-5xl [@media(max-height:850px)]:md:text-4xl leading-[1.15] tracking-tight"
          >
            Fleet Management <br />
            <span className="text-[#A14000]">System</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-sm [@media(max-height:850px)]:text-xs text-slate-200 font-medium leading-relaxed max-w-lg"
          >
            Manage fleets, drivers, vehicles, centralized dashboard and operations from one intelligent platform. 
            Improve operational efficiency, monitor vehicle health in real time, reduce operational costs, 
            and secure your logistics operations with enterprise-grade technology.
          </motion.p>

          {/* Features rows with staggered entrance */}
          <div className="space-y-4 [@media(max-height:850px)]:space-y-2.5 pt-4 [@media(max-height:850px)]:pt-2">
            
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <div className="h-9 w-9 [@media(max-height:850px)]:h-7 [@media(max-height:850px)]:w-7 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <span className="text-lg [@media(max-height:850px)]:text-sm">🚛</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Real-Time Fleet Tracking</h4>
                <p className="text-[11px] [@media(max-height:850px)]:text-[10px] text-slate-300 font-medium">Monitor vehicles live using GPS and telematics.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <div className="h-9 w-9 [@media(max-height:850px)]:h-7 [@media(max-height:850px)]:w-7 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <ShieldCheck className="h-4.5 w-4.5 [@media(max-height:850px)]:h-3.5 [@media(max-height:850px)]:w-3.5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Enterprise Security</h4>
                <p className="text-[11px] [@media(max-height:850px)]:text-[10px] text-slate-300 font-medium">Role-based authentication with secure access.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <div className="h-9 w-9 [@media(max-height:850px)]:h-7 [@media(max-height:850px)]:w-7 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <span className="text-lg [@media(max-height:850px)]:text-sm">📊</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Smart Analytics</h4>
                <p className="text-[11px] [@media(max-height:850px)]:text-[10px] text-slate-300 font-medium">Generate reports and optimize operational performance.</p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <div className="h-9 w-9 [@media(max-height:850px)]:h-7 [@media(max-height:850px)]:w-7 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <Zap className="h-4.5 w-4.5 [@media(max-height:850px)]:h-3.5 [@media(max-height:850px)]:w-3.5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Automated Operations</h4>
                <p className="text-[11px] [@media(max-height:850px)]:text-[10px] text-slate-300 font-medium">Reduce manual work through workflow automation.</p>
              </div>
            </motion.div>

          </div>

          {/* Left panel CTA buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="flex items-center gap-4 pt-4 [@media(max-height:850px)]:pt-2"
          >
            <button
              onClick={() => navigate("/about")}
              className="btn-learn-more px-7 py-3 [@media(max-height:850px)]:px-5 [@media(max-height:850px)]:py-2 rounded-xl bg-white/90 border border-gray-200 hover:bg-white text-[#1E293B] font-bold text-xs shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Learn More</span>
              <span className="btn-arrow-icon">→</span>
            </button>
          </motion.div>

        </div>

        {/* Bottom stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full mt-auto pt-6 [@media(max-height:850px)]:pt-4 border-t border-gray-300/30"
        >
          <div className="bg-[#0F2345]/85 backdrop-blur-md border border-white/10 rounded-2xl p-6 [@media(max-height:850px)]:p-4 grid grid-cols-2 md:grid-cols-4 gap-6 [@media(max-height:850px)]:gap-4 text-white shadow-xl">
            
            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl [@media(max-height:850px)]:text-xl font-black text-[#A14000] tracking-tight leading-none">500+</div>
              <p className="text-[9px] [@media(max-height:850px)]:text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Vehicles Managed</p>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl [@media(max-height:850px)]:text-xl font-black text-[#A14000] tracking-tight leading-none">250+</div>
              <p className="text-[9px] [@media(max-height:850px)]:text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Enterprise Clients</p>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl [@media(max-height:850px)]:text-xl font-black text-[#A14000] tracking-tight leading-none">1.2M+</div>
              <p className="text-[9px] [@media(max-height:850px)]:text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">KM Tracked</p>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl [@media(max-height:850px)]:text-xl font-black text-[#A14000] tracking-tight leading-none">99.9%</div>
              <p className="text-[9px] [@media(max-height:850px)]:text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Platform Uptime</p>
            </div>

          </div>
        </motion.div>


      </div>

      {/* ── RIGHT PANEL (50% Width) with AnimatePresence ── */}
      <div className="w-full lg:w-[50%] flex flex-col items-center p-6 sm:p-12 md:p-16 py-10 lg:py-12 bg-transparent lg:bg-[#F8FAFC] min-h-screen lg:min-h-0 lg:h-screen lg:overflow-y-auto relative z-10 pointer-events-none lg:pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-[440px] my-auto pointer-events-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
