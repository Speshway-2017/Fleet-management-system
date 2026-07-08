import { useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function ContactDriverModal({ isOpen, onClose, notification }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const phone = notification?.phone || "+919876543210";
  const waNumber = phone.replace(/[^0-9]/g, "");

  const handlePhoneCall = () => {
    window.open(`tel:${phone}`);
    toast.success("Driver Contact Initiated — Phone Call");
    onClose();
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${waNumber}`);
    toast.success("Driver Contact Initiated — WhatsApp");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-sm animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Icon icon="mdi:account-circle" className="w-6 h-6 text-amber-700" />
            Contact Driver
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Driver info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
            {(notification?.driver || "MR").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800">{notification?.driver || "Marcus Read"}</p>
            <p className="text-xs text-gray-500">{phone}</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-5">
          Choose how you want to contact the driver.
        </p>

        {/* Contact options */}
        <div className="space-y-3 mb-4">
          <button
            onClick={handlePhoneCall}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors"
          >
            <span className="text-xl">📞</span>
            <span className="text-sm font-semibold">Phone Call</span>
            <span className="ml-auto text-xs text-green-600">{phone}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-semibold">WhatsApp</span>
            <span className="ml-auto text-xs text-emerald-600">Open Chat</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
