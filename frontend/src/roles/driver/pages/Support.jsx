import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import driverApi from "../api/driverApi";
import {
  Headphones,
  Phone,
  Mail,
  MessageSquare,
  User,
  Clock,
  MapPin,
  Wrench,
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function DriverSupportPage() {
  const [loading, setLoading] = useState(true);
  const [supportInfo, setSupportInfo] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    setLoading(true);
    try {
      const [supportRes, profileRes] = await Promise.allSettled([
        driverApi.getSupportInfo(),
        driverApi.getProfile()
      ]);

      if (supportRes.status === "fulfilled") {
        const info = supportRes.value?.data?.data || supportRes.value?.data || supportRes.value;
        if (info) setSupportInfo(info);
      }

      if (profileRes.status === "fulfilled") {
        const prof = profileRes.value?.data?.data || profileRes.value?.data;
        if (prof) setDriverProfile(prof);
      }
    } catch (err) {
      console.error("Error fetching support info:", err);
    } finally {
      setLoading(false);
    }
  };

  const rawManager = supportInfo?.manager || {};
  const assignedManagerObj = driverProfile?.assignedManager || null;

  const managerName = (rawManager.name && rawManager.name !== "Central Dispatch Desk")
    ? rawManager.name
    : (assignedManagerObj?.name || rawManager.officeName || "Meghana");

  const managerPhone = rawManager.phone || assignedManagerObj?.phone || "9868767765";
  const managerEmail = rawManager.email || assignedManagerObj?.email || "meghana@fleet.com";
  const managerWhatsapp = rawManager.whatsapp || rawManager.phone || assignedManagerObj?.phone || "9868767765";
  const managerOffice = rawManager.officeName || rawManager.primaryHub || assignedManagerObj?.officeName || assignedManagerObj?.primaryHub || "Regional Fleet Hub";
  const workingHours = supportInfo?.workingHours || "08:00 AM - 08:00 PM (Mon - Sat)";

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#242E42]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
              <Headphones className="w-6 h-6 text-[#A14000]" />
              Support & Fleet Manager
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-poppins bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Direct Support
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
            Direct contact channels for your assigned Fleet Manager and operations assistance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white dark:bg-[#151C28] rounded-2xl border border-slate-200 dark:border-[#242E42] w-full max-w-4xl">
          <Loader2 className="w-7 h-7 text-[#A14000] animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          {/* Single Unified Fleet Manager Card */}
          <div className="bg-white dark:bg-[#151C28] border border-slate-200 dark:border-[#242E42] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Manager Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-[#242E42]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 flex items-center justify-center text-[#A14000] font-bold shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-extrabold font-poppins text-slate-900 dark:text-white text-xl break-words" title={managerName}>
                      {managerName}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-poppins bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-[#A14000] font-bold font-poppins mt-0.5">
                    Assigned Fleet Manager • Direct Office
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Contact your assigned Fleet Manager for shift scheduling, trip acceptance, vehicle document inquiries, and operational leave requests.
            </p>

            {/* Direct Contact Channels */}
            <div className="space-y-3.5">
              {/* Phone Channel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-slate-100/80 dark:hover:bg-slate-800 min-w-0">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-poppins">Call Fleet Manager</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-poppins truncate" title={managerPhone}>
                      {managerPhone}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${managerPhone.replace(/\s+/g, '')}`}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Call Now</span>
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* WhatsApp Channel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-slate-100/80 dark:hover:bg-slate-800 min-w-0">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-poppins">WhatsApp Support</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-poppins truncate">Direct Chat Channel</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${managerWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>WhatsApp</span>
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Email Channel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-slate-100/80 dark:hover:bg-slate-800 min-w-0">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-[#0D1B2A] dark:text-slate-200 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-poppins">Email Office</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-poppins truncate" title={managerEmail}>
                      {managerEmail}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${managerEmail}`}
                  className="px-5 py-2.5 bg-[#0D1B2A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Send Email</span>
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Hub & Working Hours Strip */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-[#A14000] shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Office Hub:</strong> {managerOffice}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Hours:</strong> {workingHours}</span>
              </div>
            </div>

            {/* Report Vehicle Issue CTA Card */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-[#A14000] dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Wrench className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-poppins">Vehicle Breakdown or Issue?</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Submit an emergency maintenance ticket with photos directly to your fleet manager.</p>
                </div>
              </div>
              <Link
                to="/driver/maintenance"
                className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] text-white rounded-lg text-xs font-bold font-poppins transition shrink-0 text-center shadow-xs"
              >
                Raise Issue
              </Link>
            </div>

            {/* Verified Badge Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#242E42] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Official Assigned Fleet Manager Contact</span>
              </div>
              <span>Fleet Support ID: FM-IN-2045</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
