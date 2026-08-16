import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import { Headphones, Phone, Mail, MessageSquare, User, RefreshCw } from "lucide-react";

export default function DriverSupportPage() {
  const [loading, setLoading] = useState(false);
  const [supportInfo, setSupportInfo] = useState(null);

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    try {
      const res = await driverApi.getSupportInfo();
      const info = res?.data?.data || res?.data;
      if (info && (info.manager || info.dispatcher)) {
        setSupportInfo(info);
      } else {
        setSupportInfo({
          manager: { name: "Fleet Manager Office", phone: "+919876543210", email: "manager@fleet.com" },
          dispatcher: { name: "Central Dispatch Desk", phone: "+919876543211", email: "dispatch@fleet.com" },
        });
      }
    } catch (err) {
      console.error("Error fetching support info:", err);
    } finally {
      setLoading(false);
    }
  };



  const manager = supportInfo?.manager || {
    name: supportInfo?.dispatcherName || "Fleet Manager Office",
    phone: supportInfo?.phone || "+919876543210",
    email: supportInfo?.email || "manager@fleet.com",
    whatsapp: supportInfo?.whatsapp || supportInfo?.phone || "+919876543210"
  };
  const dispatcher = supportInfo?.dispatcher || {
    name: supportInfo?.dispatcherName || "Central Dispatch Desk",
    phone: supportInfo?.phone || "+919876543211",
    email: supportInfo?.email || "dispatch@fleet.com"
  };

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#242E42]">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-[#A14000]" />
            Support & Dispatch Helpline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Direct 24/7 contact channels for your Fleet Manager and Central Dispatcher.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manager Card */}
        <div className="bg-white dark:bg-[#151C28] border border-slate-200 dark:border-[#242E42] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-[#242E42]">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 flex items-center justify-center text-[#A14000] font-bold">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-lg">{manager.name}</h3>
              <p className="text-xs text-[#A14000] font-bold font-poppins mt-0.5">Assigned Fleet Manager</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call Fleet Manager</p>
                  <p className="text-xs font-bold text-slate-900 font-poppins">{manager.phone || "Not Available"}</p>
                </div>
              </div>
              <a
                href={`tel:${manager.phone}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Call Now</span>
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#25D366] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Support</p>
                  <p className="text-xs font-bold text-slate-900 font-poppins">Direct Chat Channel</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${(manager.whatsapp || manager.phone || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>WhatsApp</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-[#0D1B2A] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Office</p>
                  <p className="text-xs font-bold text-slate-900 font-poppins">{manager.email || "manager@fleet.com"}</p>
                </div>
              </div>
              <a
                href={`mailto:${manager.email}`}
                className="px-4 py-2 bg-[#0D1B2A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send Email</span>
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Dispatcher Card */}
        <div className="bg-white dark:bg-[#151C28] border border-slate-200 dark:border-[#242E42] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-[#242E42]">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#A14000] font-bold">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-lg">{dispatcher.name}</h3>
              <p className="text-xs text-[#A14000] font-bold font-poppins mt-0.5">24/7 Emergency Dispatch Helpline</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#A14000] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">24/7 Emergency Helpline</p>
                  <p className="text-xs font-bold text-slate-900 font-poppins">{dispatcher.phone || "Not Available"}</p>
                </div>
              </div>
              <a
                href={`tel:${dispatcher.phone}`}
                className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Call Dispatch</span>
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-[#0D1B2A] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Dispatch Desk</p>
                  <p className="text-xs font-bold text-slate-900 font-poppins">{dispatcher.email || "dispatch@fleet.com"}</p>
                </div>
              </div>
              <a
                href={`mailto:${dispatcher.email}`}
                className="px-4 py-2 bg-[#0D1B2A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold font-poppins transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send Email</span>
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
