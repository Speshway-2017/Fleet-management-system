import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import { Headphones, Phone, Mail, MessageSquare, User, RefreshCw } from "lucide-react";

export default function DriverSupportPage() {
  const [loading, setLoading] = useState(true);
  const [supportInfo, setSupportInfo] = useState(null);

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getSupportInfo();
      if (res?.success && res.data) {
        setSupportInfo(res.data);
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-poppins">
        <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
      </div>
    );
  }

  const manager = supportInfo?.manager || { name: "Fleet Manager", phone: "+919876543210", email: "manager@fleet.com" };
  const dispatcher = supportInfo?.dispatcher || { name: "Central Dispatch Desk", phone: "+919876543211", email: "dispatch@fleet.com" };

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-[#B45A0A]" />
            Support & Dispatch Helpline
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Direct 24/7 contact channels for your Fleet Manager and Central Dispatcher.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manager Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B45A0A] font-bold">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold font-poppins text-slate-900 text-lg">{manager.name}</h3>
              <p className="text-xs text-[#B45A0A] font-bold font-poppins mt-0.5">Assigned Fleet Manager</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${manager.phone}`}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold font-poppins flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#B45A0A]" />
                <span>Call Phone: {manager.phone}</span>
              </div>
              <span className="text-[10px] text-[#B45A0A] font-bold uppercase">Call Now</span>
            </a>

            <a
              href={`https://wa.me/${manager.phone?.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-[#B45A0A] border border-amber-200 rounded-xl text-xs font-semibold font-poppins flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </div>
              <span className="text-[10px] font-bold uppercase">Open WhatsApp</span>
            </a>

            <a
              href={`mailto:${manager.email}`}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold font-poppins flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email: {manager.email}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Send Email</span>
            </a>
          </div>
        </div>

        {/* Dispatcher Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold font-poppins text-slate-900 text-lg">{dispatcher.name}</h3>
              <p className="text-xs text-blue-600 font-bold font-poppins mt-0.5">24/7 Emergency Dispatch Helpline</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${dispatcher.phone}`}
              className="w-full py-3 px-4 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-between transition shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>Emergency Hotline: {dispatcher.phone}</span>
              </div>
              <span className="text-[10px] uppercase font-extrabold">Call Dispatch</span>
            </a>

            <a
              href={`mailto:${dispatcher.email}`}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold font-poppins flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email Dispatch Desk: {dispatcher.email}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Send Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
