import { useNavigate } from "react-router-dom";
import { Check, Navigation, AlertTriangle, Info, ExternalLink } from "lucide-react";

export default function NotificationCard({ notification, onMarkRead }) {
  const navigate = useNavigate();

  if (!notification) return null;

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;

    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification._id || notification.id);
    }

    const type = (notification.type || "").toLowerCase();
    const title = (notification.title || "").toLowerCase();
    const message = (notification.message || notification.body || notification.description || "").toLowerCase();
    const tripId = notification.metadata?.tripId || notification.tripId;
    let extractedTicketId = notification.metadata?.ticketId || notification.metadata?.complaintId;
    if (!extractedTicketId) {
      const match = (title + " " + message).match(/TKT-VEH-[\w-]+/i);
      if (match) extractedTicketId = match[0];
    }

    if (extractedTicketId || title.includes("ticket") || title.includes("mechanic") || title.includes("maintenance") || message.includes("tkt-") || message.includes("mechanic") || type.includes("maintenance") || type.includes("issue") || type.includes("complaint") || type.includes("ticket")) {
      navigate(extractedTicketId ? `/driver/maintenance?ticketId=${encodeURIComponent(extractedTicketId)}` : "/driver/maintenance");
    } else if (tripId) {
      navigate("/driver/trips");
    } else if (type.includes("trip") || title.includes("trip") || message.includes("trip") || message.includes("trp-") || title.includes("assigned")) {
      navigate("/driver/trips");
    } else if (type.includes("fuel") || title.includes("fuel") || message.includes("fuel")) {
      navigate("/driver/fuel");
    } else if (type.includes("support") || title.includes("support") || message.includes("support")) {
      navigate("/driver/support");
    } else if (type.includes("vehicle") || title.includes("vehicle") || message.includes("vehicle")) {
      navigate("/driver/vehicle");
    } else {
      navigate("/driver/trips");
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "trip":
      case "trip_assigned":
      case "trip_accepted":
      case "trip_completed":
        return <Navigation className="w-5 h-5 text-[#B45A0A]" />;
      case "warning":
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-4 rounded-2xl border transition shadow-sm flex items-start justify-between gap-4 font-nunito cursor-pointer hover:border-[#B45A0A] hover:shadow-md ${
        notification.isRead
          ? "bg-slate-50/70 border-slate-200 text-slate-500"
          : "bg-white border-l-4 border-l-[#B45A0A] border-slate-200 text-slate-900 shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm font-poppins text-slate-900 flex items-center gap-1.5">
              <span>{notification.title || "Notification"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-70" />
            </h4>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-[#B45A0A] animate-ping" />
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message || notification.body}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-2">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now"}
          </p>
        </div>
      </div>

      {!notification.isRead && onMarkRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification._id || notification.id);
          }}
          className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-400 hover:text-[#B45A0A] border border-slate-200 transition shrink-0"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
