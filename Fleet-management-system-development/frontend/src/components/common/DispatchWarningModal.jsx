import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function DispatchWarningModal({ isOpen, onClose, notification }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape" && !loading) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSendWarning = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success("Warning Sent Successfully");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Icon icon="mdi:alert-outline" className="w-6 h-6 text-red-600" />
            Dispatch Warning
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to send an emergency warning to the assigned driver?
        </p>

        {/* Details */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Vehicle</span>
            <span className="font-bold text-gray-800">{notification?.vehicleId || "#TRK-8821"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Driver</span>
            <span className="font-bold text-gray-800">{notification?.driver || "Marcus Read"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Violation</span>
            <span className="font-bold text-red-600">Overspeeding — 95 mph in 65 mph zone</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSendWarning}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Warning"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
