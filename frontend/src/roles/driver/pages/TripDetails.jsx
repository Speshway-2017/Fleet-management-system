import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import driverApi from "../api/driverApi";
import MapView from "../components/MapView";
import { useDriverSocket } from "../hooks/useDriverSocket";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  FileCheck,
  Scale,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  Play,
  Lock,
  UserCheck,
  MapPin,
  Navigation,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function DriverTripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [podFile, setPodFile] = useState(null);
  const [uploadingPod, setUploadingPod] = useState(false);
  const [weighbridgeFile, setWeighbridgeFile] = useState(null);
  const [uploadingWeighbridge, setUploadingWeighbridge] = useState(false);
  const [togglingLocation, setTogglingLocation] = useState(false);
  const [simulatedLat, setSimulatedLat] = useState(null);
  const [simulatedLng, setSimulatedLng] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  useDriverSocket({
    onTripStatusUpdated: () => fetchTripDetails(),
    on15MinReminder: (data) => {
      toast.success(data?.message || "🔔 Your trip starts in 15 minutes! Start button is unlocked.");
      fetchTripDetails();
    }
  });

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getTrips();
      if (res?.success && Array.isArray(res.data)) {
        const found = res.data.find(
          t => (t._id || t.id || t.tripId) === id || String(t._id || t.id || t.tripId) === String(id)
        );
        if (found) {
          setTrip(found);
        } else {
          // Try fetching current trip as fallback
          const curRes = await driverApi.getCurrentTrip();
          if (curRes?.success && curRes.data) {
            setTrip(curRes.data);
          } else {
            toast.error("Trip not found");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching trip details:", err);
    } finally {
      setLoading(false);
    }
  };

  const tripId = trip?._id || trip?.id || trip?.tripId || id;

  // Live truck position simulation along route when trip is active
  useEffect(() => {
    if (!trip) return;
    const rawSt = (trip.status || "").toUpperCase();
    const isActive = ["IN PROGRESS", "STARTED", "DISPATCHED", "EN_ROUTE", "IN_TRANSIT", "ON TRANSIT"].includes(rawSt);

    if (isActive) {
      const startLat = trip.origin?.coordinates ? trip.origin.coordinates[1] : 19.076;
      const startLng = trip.origin?.coordinates ? trip.origin.coordinates[0] : 72.8777;
      const endLat = trip.destination?.coordinates ? trip.destination.coordinates[1] : 18.5204;
      const endLng = trip.destination?.coordinates ? trip.destination.coordinates[0] : 73.8567;

      let step = 0;
      const interval = setInterval(() => {
        step = (step + 1) % 100;
        const ratio = step / 100;
        const currentLat = startLat + (endLat - startLat) * ratio;
        const currentLng = startLng + (endLng - startLng) * ratio;
        setSimulatedLat(currentLat);
        setSimulatedLng(currentLng);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [trip]);

  const handleRespond = async (action) => {
    if (!tripId) return;
    try {
      const res = await driverApi.respondToTripAssignment(tripId, action);
      if (res?.success) {
        const isAccept = action?.toLowerCase() === "accept" || action?.toLowerCase() === "accepted";
        toast.success(isAccept ? "Trip accepted successfully! Moved to Upcoming." : "Trip rejected.");
        if (isAccept) {
          fetchTripDetails();
        } else {
          navigate("/driver/trips");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!tripId) return;
    try {
      const res = await driverApi.updateTripStatus(tripId, { status: newStatus });
      if (res?.success) {
        toast.success(newStatus === "Start Trip" || newStatus === "In Progress" ? "🚀 Trip started! Live GPS tracking activated." : `Trip status updated to ${newStatus}`);
        fetchTripDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update trip status");
    }
  };

  const handleToggleCustomerLocation = async () => {
    if (!tripId) return;
    setTogglingLocation(true);
    try {
      const newReachedState = !trip.customerLocationReached;
      const res = await driverApi.toggleCustomerLocation(tripId, { reached: newReachedState });
      if (res?.success) {
        toast.success(
          newReachedState
            ? "📍 Customer location reached! Proof of Delivery (POD) & Weighbridge uploads are unlocked."
            : "Customer location status reset."
        );
        fetchTripDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update arrival status");
    } finally {
      setTogglingLocation(false);
    }
  };

  const handlePodUpload = async (e) => {
    e.preventDefault();
    if (!podFile) {
      toast.error("Please select a Proof of Delivery file");
      return;
    }
    if (!trip?.customerLocationReached) {
      toast.error("POD upload is locked. Please reach customer location first.");
      return;
    }
    setUploadingPod(true);
    try {
      const formData = new FormData();
      formData.append("tripId", tripId);
      formData.append("file", podFile);

      const res = await driverApi.uploadPOD(formData);
      if (res?.success) {
        toast.success("Proof of Delivery uploaded successfully!");
        setPodFile(null);
        fetchTripDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload POD");
    } finally {
      setUploadingPod(false);
    }
  };

  const handleWeighbridgeUpload = async (e) => {
    e.preventDefault();
    if (!weighbridgeFile) {
      toast.error("Please select a Weighbridge slip file");
      return;
    }
    if (!trip?.customerLocationReached) {
      toast.error("Weighbridge slip upload is locked. Please reach customer location first.");
      return;
    }
    setUploadingWeighbridge(true);
    try {
      const formData = new FormData();
      formData.append("tripId", tripId);
      formData.append("file", weighbridgeFile);

      const res = await driverApi.uploadWeighbridge(formData);
      if (res?.success) {
        toast.success("Weighbridge slip uploaded successfully!");
        setWeighbridgeFile(null);
        fetchTripDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload Weighbridge slip");
    } finally {
      setUploadingWeighbridge(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-poppins">
        <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm font-nunito">
        <p className="text-slate-600 font-medium">Trip not found or access denied.</p>
        <Link to="/driver/trips" className="mt-4 inline-block text-[#B45A0A] text-sm font-semibold hover:underline font-poppins">
          ← Back to Trips
        </Link>
      </div>
    );
  }

  const tripNumber = trip.tripNumber || (typeof trip.tripId === 'string' && trip.tripId.startsWith('TRIP') ? trip.tripId : `TRIP-${String(tripId).slice(-6)}`);
  const rawStatus = (trip.status || "DISPATCHED").toUpperCase();
  const departureTime = trip.departureTime || trip.scheduledDate;

  // 15-minute start restriction rule
  const checkIsStartEnabled = (departureTimeStr) => {
    if (!departureTimeStr) return true;
    try {
      const dep = new Date(departureTimeStr);
      if (isNaN(dep.getTime())) return true;
      const now = new Date();
      const marginMs = 15 * 60 * 1000;
      return now.getTime() >= dep.getTime() - marginMs;
    } catch (_) {
      return true;
    }
  };

  const isStartEnabled = checkIsStartEnabled(departureTime);

  const getLockTimeText = (departureTimeStr) => {
    if (!departureTimeStr) return "";
    try {
      const dep = new Date(departureTimeStr);
      if (isNaN(dep.getTime())) return "";
      const unlockTime = new Date(dep.getTime() - 15 * 60 * 1000);
      return unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return "";
    }
  };

  const unlockTimeStr = getLockTimeText(departureTime);

  // Map Coordinates & Live Position
  const originCoord = trip.origin?.coordinates
    ? { lat: trip.origin.coordinates[1], lng: trip.origin.coordinates[0], address: trip.origin.address || trip.startLocation }
    : { lat: 19.076, lng: 72.8777, address: trip.startLocation || trip.origin?.address || "Origin" };

  const destCoord = trip.destination?.coordinates
    ? { lat: trip.destination.coordinates[1], lng: trip.destination.coordinates[0], address: trip.destination.address || trip.endLocation }
    : { lat: 18.5204, lng: 73.8567, address: trip.endLocation || trip.destination?.address || "Destination" };

  const currentLoc = simulatedLat && simulatedLng
    ? { lat: simulatedLat, lng: simulatedLng }
    : trip.currentLocation?.coordinates
    ? { lat: trip.currentLocation.coordinates[1], lng: trip.currentLocation.coordinates[0] }
    : originCoord;

  const statusPipeline = [
    { key: "In Progress", label: "Start / In Progress" },
    { key: "En Route", label: "En Route" },
    { key: "At Loading", label: "At Loading" },
    { key: "In Transit", label: "In Transit" },
    { key: "Delivered", label: "Delivered" },
    { key: "Completed", label: "Completed" },
  ];

  const vehicleObj = typeof trip.vehicle === 'object' ? trip.vehicle : null;
  const vehiclePlate = vehicleObj?.registrationNumber || trip.vehiclePlate || (typeof trip.vehicle === 'string' ? trip.vehicle : 'Assigned Truck');
  const vehicleModel = vehicleObj?.model || trip.vehicleName || 'Fleet Heavy Transport';
  const vehicleStatus = vehicleObj?.currentStatus || 'On Trip';
  const vehicleFuel = vehicleObj?.fuelLevel ? `${vehicleObj.fuelLevel}%` : '88%';

  const customerReached = Boolean(trip.customerLocationReached);

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            to="/driver/trips"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold font-poppins text-slate-900">{tripNumber}</h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-[#B45A0A] border border-amber-200 font-poppins">
                {rawStatus}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Scheduled Departure: {departureTime ? new Date(departureTime).toLocaleString() : "Today"}
            </p>
          </div>
        </div>

        {/* Action Header for Pending Trips */}
        {(rawStatus === "ASSIGNED" || rawStatus === "PENDING") && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRespond("accept")}
              className="py-2.5 px-5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Trip
            </button>
            <button
              onClick={() => handleRespond("reject")}
              className="py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 font-semibold font-poppins rounded-xl text-xs flex items-center gap-2 transition"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}

        {/* Action Header for Upcoming Accepted Trips */}
        {(rawStatus === "ACCEPTED" || rawStatus === "SCHEDULED" || rawStatus === "UPCOMING") && (
          <div className="flex flex-col sm:items-end gap-1">
            <button
              onClick={() => handleStatusChange("Start Trip")}
              disabled={!isStartEnabled}
              className={`py-2.5 px-6 rounded-xl text-xs font-bold font-poppins flex items-center gap-2 transition shadow-sm ${
                isStartEnabled
                  ? "bg-[#B45A0A] hover:bg-[#9A4D08] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
              }`}
            >
              {isStartEnabled ? (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Trip Now
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" /> Start Locked (Unlocks 15m before)
                </>
              )}
            </button>
            {!isStartEnabled && unlockTimeStr && (
              <span className="text-[11px] text-amber-700 font-semibold">
                🔒 Button unlocks at {unlockTimeStr} (15 mins before start)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Customer Location Reached Toggle Card */}
      <div className="bg-gradient-to-r from-amber-50/90 to-amber-100/40 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${customerReached ? "bg-emerald-500 text-white shadow-sm" : "bg-amber-100 text-[#B45A0A]"}`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-poppins text-slate-900">Arrived at Customer Location</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-poppins ${customerReached ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-200 text-amber-900 border border-amber-300"}`}>
                {customerReached ? "CUSTOMER REACHED" : "EN ROUTE TO CUSTOMER"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {customerReached
                ? "✓ Driver arrived at destination. Proof of Delivery (POD) & Weighbridge uploads are unlocked!"
                : "Toggle switch ON when you reach the destination to automatically unlock POD & Weighbridge uploads."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold font-poppins text-slate-700">
            {customerReached ? "Reached" : "Not Reached"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={customerReached}
              onChange={handleToggleCustomerLocation}
              disabled={togglingLocation}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Main Grid: Interactive Live Tracking Map + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map View (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[480px]">
            <MapView
              driverLocation={currentLoc}
              origin={originCoord}
              destination={destCoord}
              speed={rawStatus === "ACCEPTED" || rawStatus === "ASSIGNED" ? 0 : 54}
              eta={trip.eta || "1h 15m"}
              distance={trip.remainingDistance || "38 km"}
            />
          </div>

          {/* Location Stops Route Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>GPS Tracking & Route Stops</span>
              <span className="text-xs font-semibold text-[#B45A0A] lowercase font-nunito">Live Route GPS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stop 1: Pickup */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Stop 1 - Pickup</span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{trip.startLocation || originCoord.address}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Completed ✓</span>
                </div>
              </div>

              {/* Stop 2: En Route Checkpoint */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Stop 2 - Checkpoint</span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">Logistics Weighbridge Station</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Passed ✓</span>
                </div>
              </div>

              {/* Stop 3: Destination */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${customerReached ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-200"}`}>
                {customerReached ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Stop 3 - Destination</span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{trip.endLocation || destCoord.address}</p>
                  <span className={`text-[10px] font-semibold ${customerReached ? "text-emerald-700" : "text-amber-800"}`}>
                    {customerReached ? "Customer Reached ✓" : "Pending Arrival"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Pipeline Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-900 mb-4 uppercase tracking-wider">
              Update Trip Progress Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {statusPipeline.map((step) => {
                const isActiveStep = rawStatus === step.key.toUpperCase();
                return (
                  <button
                    key={step.key}
                    onClick={() => handleStatusChange(step.key)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold font-poppins transition text-center ${
                      isActiveStep
                        ? "bg-[#B45A0A] text-white font-bold shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Vehicle Details & Dynamic Document Uploads */}
        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B45A0A]" /> Assigned Vehicle Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Plate / Registration:</span>
                <span className="font-bold text-slate-900 font-mono">{vehiclePlate}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Vehicle Model:</span>
                <span className="font-semibold text-slate-900 font-poppins">{vehicleModel}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Vehicle Status:</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{vehicleStatus}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Fuel Level:</span>
                <span className="font-semibold text-slate-900 font-poppins">{vehicleFuel}</span>
              </div>
            </div>
          </div>

          {/* Cargo & Route Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Trip Specs & Cargo Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 py-1 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#B45A0A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Origin</span>
                  <p className="font-semibold text-slate-900 font-poppins">{trip.startLocation || originCoord.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 py-1 border-b border-slate-100">
                <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Destination</span>
                  <p className="font-semibold text-slate-900 font-poppins">{trip.endLocation || destCoord.address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cargo Type:</span>
                <span className="font-semibold text-slate-900 font-poppins">{trip.cargoDetails?.cargoType || trip.cargoType || "Standard Freight"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Weight:</span>
                <span className="font-semibold text-slate-900 font-poppins">{trip.cargoDetails?.weight ? `${trip.cargoDetails.weight} Tons` : "15 Tons"}</span>
              </div>
            </div>
          </div>

          {/* POD Document Upload Form */}
          <div className={`bg-white border rounded-2xl p-6 shadow-sm transition ${customerReached ? "border-slate-200" : "border-slate-200 bg-slate-50/50"}`}>
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#B45A0A]" /> Upload Proof of Delivery (POD)
              </span>
              {customerReached ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">UNLOCKED</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">LOCKED</span>
              )}
            </h3>

            {!customerReached && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl my-3 text-[11px] text-amber-800 font-medium">
                🔒 Lock: Please switch ON "Arrived at Customer Location" toggle above to enable POD file upload.
              </div>
            )}

            <form onSubmit={handlePodUpload} className="space-y-3 mt-4">
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={!customerReached}
                onChange={(e) => setPodFile(e.target.files[0])}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#B45A0A] hover:file:bg-amber-100 disabled:opacity-40 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!customerReached || uploadingPod || !podFile}
                className="w-full py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                {uploadingPod ? "Uploading POD..." : "Submit Proof of Delivery"}
              </button>
            </form>
          </div>

          {/* Weighbridge Slip Form */}
          <div className={`bg-white border rounded-2xl p-6 shadow-sm transition ${customerReached ? "border-slate-200" : "border-slate-200 bg-slate-50/50"}`}>
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#B45A0A]" /> Upload Weighbridge Slip
              </span>
              {customerReached ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">UNLOCKED</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">LOCKED</span>
              )}
            </h3>

            {!customerReached && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl my-3 text-[11px] text-amber-800 font-medium">
                🔒 Lock: Please switch ON "Arrived at Customer Location" toggle above to enable Weighbridge slip upload.
              </div>
            )}

            <form onSubmit={handleWeighbridgeUpload} className="space-y-3 mt-4">
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={!customerReached}
                onChange={(e) => setWeighbridgeFile(e.target.files[0])}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#B45A0A] hover:file:bg-amber-100 disabled:opacity-40 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!customerReached || uploadingWeighbridge || !weighbridgeFile}
                className="w-full py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                {uploadingWeighbridge ? "Uploading Slip..." : "Submit Weighbridge Slip"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

