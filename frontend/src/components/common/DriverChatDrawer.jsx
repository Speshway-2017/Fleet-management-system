import { useState } from "react";
import { X, Phone, MessageSquare, Mail, ExternalLink, Copy, Check, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function DriverChatDrawer({
  isOpen,
  onClose,
  driverName = "Assigned Driver",
  driverPhone = "+91 98765 43210",
  driverEmail = "driver@fleetmanagement.com"
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = (driverPhone || "").replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const getInitials = (name) => {
    return (name || "D")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(driverPhone);
    setCopied(true);
    toast.success("Phone number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = (customText = "") => {
    const textParam = customText ? `?text=${encodeURIComponent(customText)}` : "";
    window.open(`https://wa.me/${formattedPhone}${textParam}`, "_blank");
  };

  const openPhoneCall = () => {
    window.open(`tel:${driverPhone}`, "_self");
  };

  const openSMS = () => {
    window.open(`sms:${driverPhone}`, "_self");
  };

  const openEmail = () => {
    window.open(`mailto:${driverEmail || "driver@fleetmanagement.com"}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-xs select-none">
      {/* Backdrop overlay click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body */}
      <div className="w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right relative">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#853400] to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {getInitials(driverName)}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base leading-tight text-white">{driverName}</h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{driverPhone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Options Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-5 custom-scrollbar">
          
          {/* Driver Card Summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Driver</span>
              <h4 className="font-poppins font-bold text-sm text-slate-800">{driverName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{driverPhone}</p>
            </div>
            <button
              onClick={handleCopyPhone}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Phone Number"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">Choose External App</span>

            {/* 1. WhatsApp Button */}
            <button
              onClick={() => openWhatsApp("Hello, contacting you regarding your active trip status.")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-poppins font-bold text-sm leading-snug">WhatsApp Messenger</h4>
                  <p className="text-xs text-emerald-100">Send direct chat, voice notes & media</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/80" />
            </button>

            {/* 2. Phone Call Button */}
            <button
              onClick={openPhoneCall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-poppins font-bold text-sm leading-snug">Phone Call / Dialer</h4>
                  <p className="text-xs text-blue-100">Launch system dialer directly</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/80" />
            </button>

            {/* 3. SMS Message Button */}
            <button
              onClick={openSMS}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-poppins font-bold text-sm leading-snug">SMS Text Message</h4>
                  <p className="text-xs text-amber-100">Send standard cellular SMS</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/80" />
            </button>

            {/* 4. Email Button */}
            <button
              onClick={openEmail}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-poppins font-bold text-sm leading-snug">Email Client</h4>
                  <p className="text-xs text-slate-300">Send official fleet email</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* Quick Message Templates for WhatsApp */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick WhatsApp Templates</span>
            <div className="space-y-2">
              <button
                onClick={() => openWhatsApp("Please stay alert and maintain speed compliance on your trip.")}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                ⚡ "Please stay alert and maintain speed compliance."
              </button>
              <button
                onClick={() => openWhatsApp("Please share your current location status and estimated arrival time.")}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                📍 "Please share your current location status and ETA."
              </button>
              <button
                onClick={() => openWhatsApp("Please confirm fuel status and upload recent toll/fuel receipts.")}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                ⛽ "Please confirm fuel status and upload receipts."
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Direct external communications open seamlessly in your installed device apps.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Close Contact Menu
          </button>
        </div>

      </div>
    </div>
  );
}

