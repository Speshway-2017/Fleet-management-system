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

    const navState = { state: { fromNotification: true, from: "/driver/notifications" } };

    if (extractedTicketId || title.includes("ticket") || title.includes("mechanic") || title.includes("maintenance") || message.includes("tkt-") || message.includes("mechanic") || type.includes("maintenance") || type.includes("issue") || type.includes("complaint") || type.includes("ticket")) {
      navigate(extractedTicketId ? `/driver/maintenance?ticketId=${encodeURIComponent(extractedTicketId)}` : "/driver/maintenance", navState);
    } else if (tripId) {
      navigate(`/driver/trips/${tripId}`, navState);
    } else if (type.includes("trip") || title.includes("trip") || message.includes("trip") || message.includes("trp-") || title.includes("assigned")) {
      navigate(tripId ? `/driver/trips/${tripId}` : "/driver/trips", navState);
    } else if (type.includes("fuel") || title.includes("fuel") || message.includes("fuel")) {
      navigate("/driver/fuel", navState);
    } else if (type.includes("support") || title.includes("support") || message.includes("support")) {
      navigate("/driver/support", navState);
    } else if (type.includes("vehicle") || title.includes("vehicle") || message.includes("vehicle")) {
      navigate("/driver/vehicle", navState);
    } else {
      navigate("/driver/trips", navState);
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "trip":
      case "trip_assigned":
      case "trip_accepted":
      case "trip_completed":
        return <Navigation className="w-4 h-4 text-[#A14000]" />;
      case "warning":
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#1E293B] px-4 py-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative group ${
        !notification.isRead ? 'border-l-4 border-l-[#A14000] dark:bg-[#1E293B]/70' : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Icon Badge */}
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#A14000] dark:text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            {getIcon(notification.type)}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <h4 className="font-poppins font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-[#A14000] transition-colors flex items-center gap-1.5">
              <span>{notification.title || "Notification"}</span>
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#A14000] shrink-0" title="Unread" />
              )}
              <ExternalLink className="w-3 h-3 text-slate-400 opacity-60 shrink-0 ml-1" />
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-nunito font-normal line-clamp-2 mt-1 leading-relaxed">
              {notification.message || notification.body || notification.description}
            </p>
          </div>
        </div>

        {/* Timestamp on Far Right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 font-poppins">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
          </span>
          {!notification.isRead && onMarkRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification._id || notification.id);
              }}
              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-400 hover:text-[#A14000] border border-slate-200 dark:border-slate-700 transition shrink-0 cursor-pointer"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
