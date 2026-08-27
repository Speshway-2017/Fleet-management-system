import { Link } from "react-router-dom";
import { MapPin, Navigation, Calendar, Package, ArrowRight, CheckCircle2, XCircle, Play, Lock, Truck, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TripCard({ trip, onRespond, onStatusUpdate }) {
  if (!trip) return null;

  const tripId = trip._id || trip.id || trip.tripId;
  const tripNumber = trip.tripNumber || (typeof trip.tripId === 'string' && trip.tripId.startsWith('TRIP') ? trip.tripId : `TRIP-${String(tripId).slice(-6)}`);
  const rawStatus = (trip.status || "ASSIGNED").toUpperCase();

  const getStatusBadge = (st) => {
    switch (st) {
      case "ASSIGNED":
      case "PENDING":
      case "PENDING DRIVER ACCEPTANCE":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-poppins">Pending Response</span>;
      case "ACCEPTED":
      case "SCHEDULED":
      case "UPCOMING":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-poppins">Upcoming</span>;
      case "DISPATCHED":
      case "STARTED":
      case "EN_ROUTE":
      case "IN_TRANSIT":
      case "IN PROGRESS":
      case "ON TRANSIT":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse font-poppins">Active</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-poppins">Completed</span>;
      case "REJECTED":
      case "CANCELLED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-poppins">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 font-poppins">{st}</span>;
    }
  };

  const originName = trip.origin?.address || trip.origin?.name || trip.startLocation || "Origin";
  const destinationName = trip.destination?.address || trip.destination?.name || trip.endLocation || "Destination";
  const vehicleReg = trip.vehicle?.registrationNumber || trip.vehicleId?.registrationNumber || trip.vehiclePlate || (typeof trip.vehicle === 'string' ? trip.vehicle : 'Assigned Vehicle');
  const vehicleModel = trip.vehicle?.model || trip.vehicleId?.model || trip.vehicleName || "Fleet Vehicle";

  const departureTime = trip.departureTime || trip.scheduledDate;

  // 15-minute start restriction rule
  const checkIsStartEnabled = (departureTimeStr) => {
    if (!departureTimeStr) return true;
    try {
      let cleanStr = String(departureTimeStr).trim();
      if (!/(?:Z|[-+]\d{2}(?::?\d{2})?)$/i.test(cleanStr) && !cleanStr.includes('GMT') && !cleanStr.includes('UTC')) {
        cleanStr = cleanStr.includes('T') ? cleanStr + '+05:30' : cleanStr + ' +05:30';
      }
      const dep = new Date(cleanStr);
      if (isNaN(dep.getTime())) return true;
      const now = new Date();
      const marginMs = 15 * 60 * 1000;
      
      console.log(`[TripCard Start Validation]`, {
        currentTimeUTC: now.toISOString(),
        departureTimeUTC: dep.toISOString(),
        timezoneOffset: "+05:30",
        diffMinutes: (now.getTime() - dep.getTime()) / (60 * 1000),
        isStartEnabled: now.getTime() >= dep.getTime() - marginMs
      });

      return now.getTime() >= dep.getTime() - marginMs;
    } catch (_) {
      return true;
    }
  };

  const isStartEnabled = checkIsStartEnabled(departureTime);

  const getLockTimeText = (departureTimeStr) => {
    if (!departureTimeStr) return "";
    try {
      let cleanStr = String(departureTimeStr).trim();
      if (!/(?:Z|[-+]\d{2}(?::?\d{2})?)$/i.test(cleanStr) && !cleanStr.includes('GMT') && !cleanStr.includes('UTC')) {
        cleanStr = cleanStr.includes('T') ? cleanStr + '+05:30' : cleanStr + ' +05:30';
      }
      const dep = new Date(cleanStr);
      if (isNaN(dep.getTime())) return "";
      const unlockTime = new Date(dep.getTime() - 15 * 60 * 1000);
      return unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return "";
    }
  };

  const unlockTimeStr = getLockTimeText(departureTime);

  const handleStartTripClick = () => {
    if (!isStartEnabled) {
      toast.error(`Trip start is locked! Unlocks 15 minutes before departure${unlockTimeStr ? ` (${unlockTimeStr})` : ''}.`);
      return;
    }
    if (onStatusUpdate) {
      onStatusUpdate(tripId, "Start Trip");
    }
  };

  const normStatus = rawStatus.replace(/_/g, " ").trim();
  const isPending = normStatus === "ASSIGNED" || normStatus === "PENDING" || normStatus === "PENDING DRIVER ACCEPTANCE";
  const isUpcoming = normStatus === "ACCEPTED" || normStatus === "SCHEDULED" || normStatus === "UPCOMING";
  const isCompleted = normStatus === "COMPLETED" || normStatus === "DELIVERED" || normStatus === "REJECTED" || normStatus === "CANCELLED";

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between font-nunito">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono font-bold text-[#A14000]">{tripNumber}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-600 font-semibold">{vehicleReg}</p>
              <span className="text-[10px] text-slate-400">({vehicleModel})</span>
            </div>
          </div>
          {getStatusBadge(rawStatus)}
        </div>

        {/* Route Details */}
        <div className="py-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#A14000]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold font-poppins">Origin</p>
              <p className="text-sm font-semibold text-slate-900 font-poppins line-clamp-1">{originName}</p>
            </div>
          </div>

          <div className="pl-3.5 border-l-2 border-dashed border-slate-200 my-1 ml-3.5 h-4" />

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold font-poppins">Destination</p>
              <p className="text-sm font-semibold text-slate-900 font-poppins line-clamp-1">{destinationName}</p>
            </div>
          </div>
        </div>

        {/* Specs Pill */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#A14000]" />
            <span className="truncate">{trip.cargoDetails?.cargoType || trip.cargoType || "Standard Freight"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#A14000]" />
            <span>{departureTime ? new Date(departureTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Today"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
        {isPending ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRespond && onRespond(tripId, "accept")}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Trip
              </button>
              <button
                onClick={() => onRespond && onRespond(tripId, "reject")}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-300 font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Reject Trip
              </button>
            </div>
            <Link
              to={`/driver/trips/${tripId}`}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold font-poppins rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <Eye className="w-3.5 h-3.5 text-[#A14000]" /> View Details First
            </Link>
          </div>
        ) : isUpcoming ? (
          <div className="space-y-2">
            <button
              onClick={handleStartTripClick}
              disabled={!isStartEnabled}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-2 transition shadow-sm ${isStartEnabled
                  ? "bg-[#A14000] hover:bg-[#853400] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                }`}
            >
              {isStartEnabled ? (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Trip
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" /> Start Locked (Unlocks 15m before)
                </>
              )}
            </button>
            {!isStartEnabled && unlockTimeStr && (
              <p className="text-[10px] text-amber-700 font-medium text-center mt-1.5">
                🔒 Button unlocks at {unlockTimeStr} (15 mins prior to departure)
              </p>
            )}
            <Link
              to={`/driver/trips/${tripId}`}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold font-poppins rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <span>View Details & Tracking</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A14000]" />
            </Link>
          </div>
        ) : (
          <Link
            to={`/driver/trips/${tripId}`}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>View Details & Tracking</span>
            <ArrowRight className="w-4 h-4 text-[#A14000]" />
          </Link>
        )}
      </div>
    </div>
  );
}
