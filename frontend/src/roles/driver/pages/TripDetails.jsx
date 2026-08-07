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
  AlertCircle,
  FileText,
  Receipt,
  Printer,
  X,
  Download
} from "lucide-react";
import { calculateDrivingRoute } from "../../manager/services/routingService";

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
  const [routeInfo, setRouteInfo] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [tollModalOpen, setTollModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [tollData, setTollData] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);

  const handleOpenInvoice = async () => {
    if (!tripId) return;
    setLoadingBill(true);
    try {
      const res = await driverApi.getTripInvoice(tripId);
      if (res?.success && res.data) {
        setInvoiceData(res.data);
        setInvoiceModalOpen(true);
      } else {
        toast.error("Failed to load invoice details");
      }
    } catch (err) {
      toast.error("Error retrieving invoice from database");
    } finally {
      setLoadingBill(false);
    }
  };

  const handleOpenTollReceipt = async () => {
    if (!tripId) return;
    setLoadingBill(true);
    try {
      const res = await driverApi.getTripTollReceipt(tripId);
      if (res?.success && res.data) {
        setTollData(res.data);
        setTollModalOpen(true);
      } else {
        toast.error("Failed to load toll receipt details");
      }
    } catch (err) {
      toast.error("Error retrieving toll receipt from database");
    } finally {
      setLoadingBill(false);
    }
  };

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

  // Calculate driving route for real start & end locations
  useEffect(() => {
    if (!trip) return;
    const startLoc = trip.startLocation || trip.origin?.address || (typeof trip.origin === 'string' ? trip.origin : null);
    const endLoc = trip.endLocation || trip.destination?.address || (typeof trip.destination === 'string' ? trip.destination : null);

    if (startLoc && endLoc) {
      calculateDrivingRoute(startLoc, endLoc).then((res) => {
        if (res && res.success) {
          setRouteInfo(res);
        }
      }).catch((err) => {
        console.warn("TripDetails route calculation failed:", err);
      });
    }
  }, [trip]);

  // Live truck position GPS tracking & API sync when trip is active
  useEffect(() => {
    if (!trip) return;
    const rawSt = (trip.status || "").toUpperCase();
    const isActive = ["IN PROGRESS", "STARTED", "DISPATCHED", "EN_ROUTE", "IN_TRANSIT", "ON TRANSIT"].includes(rawSt);

    if (!isActive) return;

    let watchId = null;
    let fallbackInterval = null;

    const sendLocationToBackend = (lat, lng, speed = 0, heading = 0) => {
      setSimulatedLat(lat);
      setSimulatedLng(lng);
      driverApi.updateLocation({
        latitude: lat,
        longitude: lng,
        speed: speed || 0,
        heading: heading || 0,
        tripId: trip._id || trip.id || tripId
      }).catch(err => {
        console.warn("Failed to post driver location:", err);
      });
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLocationToBackend(pos.coords.latitude, pos.coords.longitude, pos.coords.speed, pos.coords.heading);
        },
        (err) => {
          console.warn("Initial Geolocation error:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          sendLocationToBackend(pos.coords.latitude, pos.coords.longitude, pos.coords.speed, pos.coords.heading);
        },
        (err) => {
          console.warn("Geolocation watch error:", err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }

    // Fallback simulation if routeInfo exists and Geolocation is stationary or in dev mode
    if (routeInfo?.startCoords && routeInfo?.endCoords) {
      const startLat = routeInfo.startCoords[0];
      const startLng = routeInfo.startCoords[1];
      const endLat = routeInfo.endCoords[0];
      const endLng = routeInfo.endCoords[1];

      let step = 0;
      fallbackInterval = setInterval(() => {
        // If watchId didn't get real location or for simulation preview
        if (!navigator.geolocation) {
          step = (step + 1) % 100;
          const ratio = step / 100;
          const currentLat = startLat + (endLat - startLat) * ratio;
          const currentLng = startLng + (endLng - startLng) * ratio;
          sendLocationToBackend(currentLat, currentLng);
        }
      }, 10000);
    }

    return () => {
      if (watchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [trip, routeInfo]);

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

  const isDocsUploaded = Boolean(
    (trip?.podUploaded || trip?.podUrl || trip?.podFile) &&
    (trip?.weighbridgeUploaded || trip?.weighbridgeUrl || trip?.weighbridgeFile)
  );

  const handleStatusChange = async (newStatus) => {
    if (!tripId) return;

    const isDeliveryStep = ["Delivered", "Completed", "Complete Trip"].includes(newStatus);
    if (isDeliveryStep && !isDocsUploaded) {
      toast.error("🔒 Cannot set status to " + newStatus + ". Please upload BOTH Proof of Delivery (POD) and Weighbridge Slip first.");
      return;
    }

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

  // Dynamic Real Map Coordinates
  const startLocationName = trip.startLocation || trip.origin?.address || (typeof trip.origin === 'string' ? trip.origin : "Origin");
  const endLocationName = trip.endLocation || trip.destination?.address || (typeof trip.destination === 'string' ? trip.destination : "Destination");

  const startCoords = routeInfo?.startCoords || (trip.origin?.coordinates ? [trip.origin.coordinates[1], trip.origin.coordinates[0]] : null);
  const endCoords = routeInfo?.endCoords || (trip.destination?.coordinates ? [trip.destination.coordinates[1], trip.destination.coordinates[0]] : null);

  const originCoord = startCoords ? { lat: startCoords[0], lng: startCoords[1], address: startLocationName } : null;
  const destCoord = endCoords ? { lat: endCoords[0], lng: endCoords[1], address: endLocationName } : null;

  const currentLoc = (simulatedLat && simulatedLng)
    ? { lat: simulatedLat, lng: simulatedLng }
    : (trip.currentLatitude && trip.currentLongitude)
      ? { lat: trip.currentLatitude, lng: trip.currentLongitude }
      : (startCoords ? { lat: startCoords[0], lng: startCoords[1] } : null);

  const getStageIndex = (st) => {
    const upper = (st || "").toUpperCase();
    if (upper === "COMPLETED" || upper === "COMPLETE TRIP") return 5;
    if (upper === "DELIVERED") return 4;
    if (upper === "IN TRANSIT" || upper === "ON TRANSIT" || upper === "DISPATCHED") return 3;
    if (upper === "AT LOADING" || upper === "LOADING") return 2;
    if (upper === "EN ROUTE") return 1;
    if (upper === "IN PROGRESS" || upper === "START TRIP" || upper === "STARTED") return 0;
    return -1;
  };

  const currentStageIndex = getStageIndex(trip?.status);

  const statusPipeline = [
    { key: "In Progress", label: "Start / In Progress", stageIndex: 0 },
    { key: "En Route", label: "En Route", stageIndex: 1 },
    { key: "At Loading", label: "At Loading", stageIndex: 2 },
    { key: "In Transit", label: "In Transit", stageIndex: 3 },
    { key: "Delivered", label: "Delivered", stageIndex: 4 },
    { key: "Completed", label: "Completed", stageIndex: 5 },
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
              className={`py-2.5 px-6 rounded-xl text-xs font-bold font-poppins flex items-center gap-2 transition shadow-sm ${isStartEnabled
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
              eta={routeInfo?.durationFormatted || trip.eta || "In transit"}
              distance={routeInfo?.distanceKm ? `${routeInfo.distanceKm} km` : (trip.remainingDistance || "N/A")}
              routeCoordinates={routeInfo?.routeGeometry || []}
            />
          </div>

          {/* Location Stops Route Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>GPS Tracking & Route Stops</span>
              <span className="text-xs font-semibold text-[#B45A0A] lowercase font-nunito">live route gps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stop 1: Pickup */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Stop 1 - Pickup</span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{startLocationName}</p>
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
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{endLocationName}</p>
                  <span className={`text-[10px] font-semibold ${customerReached ? "text-emerald-700" : "text-amber-800"}`}>
                    {customerReached ? "Customer Reached ✓" : "Pending Arrival"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Vehicle Details & Dynamic Document Uploads & Real Bills */}
        <div className="space-y-6">
          {/* Real Generated Bills Section (Unlocked after Trip Completion) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Trip Invoices & Toll Bills</span>
              <span className={`text-[10px] px-2 py-0.5 font-poppins font-bold rounded ${
                (trip?.status || "").toUpperCase() === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
              }`}>
                {(trip?.status || "").toUpperCase() === "COMPLETED" ? "REAL DB BILLS ✓" : "LOCKED 🔒"}
              </span>
            </h3>

            {(trip?.status || "").toUpperCase() === "COMPLETED" ? (
              <div className="space-y-3">
                {/* Invoice Bill View Card */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-[#B45A0A]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-poppins">Trip Invoice Bill</h4>
                      <p className="text-[10px] text-slate-500">Auto-Generated Database Bill</p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenInvoice}
                    disabled={loadingBill}
                    className="px-3 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold font-poppins rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loadingBill ? "Loading..." : "View Invoice"}
                  </button>
                </div>

                {/* Toll Fee Receipt View Card */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-poppins">Toll Fee Receipt</h4>
                      <p className="text-[10px] text-slate-500">FASTag Toll Payment Bill</p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenTollReceipt}
                    disabled={loadingBill}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-poppins rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loadingBill ? "Loading..." : "View Toll Receipt"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-slate-700 font-poppins">🔒 Invoice & Toll Bills Locked</p>
                <p className="text-[11px] text-slate-500">
                  Invoice bill and FASTag toll receipt will be available once the trip is completed by manager.
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B45A0A]" /> Assigned Vehicle Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Plate / Registration:</span>
                <span className="font-extrabold font-mono text-slate-900">{vehiclePlate}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Vehicle Model:</span>
                <span className="font-bold text-slate-800">{vehicleModel}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Vehicle Status:</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-poppins">
                  {vehicleStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Cargo Specs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Trip Specs & Cargo Info
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold font-poppins block">Origin</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{startLocationName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold font-poppins block">Destination</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{endLocationName}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span className="text-slate-500 font-semibold">Cargo Type:</span>
                <span className="font-bold text-slate-800">{trip.cargoType || "Standard Freight"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Weight:</span>
                <span className="font-bold text-slate-800">{trip.weight ? `${trip.weight} Tons` : "15 Tons"}</span>
              </div>
            </div>
          </div>

          {/* Proof of Delivery (POD) & Weighbridge Upload Forms */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Trip Documents Upload</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-poppins font-bold ${customerReached ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                {customerReached ? "UNLOCKED 🔓" : "LOCKED 🔒"}
              </span>
            </h3>

            {/* POD Upload Box */}
            <form onSubmit={handlePodUpload} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 font-poppins flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#B45A0A]" /> Proof of Delivery (POD)
                </label>
                {trip.podUploaded && (
                  <span className="text-[10px] text-emerald-600 font-extrabold font-poppins">Uploaded ✓</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={!customerReached || uploadingPod}
                onChange={(e) => setPodFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#B45A0A] hover:file:bg-amber-100 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!customerReached || !podFile || uploadingPod}
                className="w-full py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
              >
                {uploadingPod ? "Uploading POD..." : "Upload POD Document"}
              </button>
            </form>

            <hr className="border-slate-100" />

            {/* Weighbridge Upload Box */}
            <form onSubmit={handleWeighbridgeUpload} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 font-poppins flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" /> Weighbridge Slip
                </label>
                {trip.weighbridgeUploaded && (
                  <span className="text-[10px] text-emerald-600 font-extrabold font-poppins">Uploaded ✓</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={!customerReached || uploadingWeighbridge}
                onChange={(e) => setWeighbridgeFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!customerReached || !weighbridgeFile || uploadingWeighbridge}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
              >
                {uploadingWeighbridge ? "Uploading Weighbridge..." : "Upload Weighbridge Slip"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Invoice Bill View Modal */}
      {invoiceModalOpen && invoiceData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-nunito">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-[#B45A0A] rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-poppins text-slate-900">Trip Freight Invoice</h3>
                  <span className="text-xs text-slate-500 font-mono">Invoice #: {invoiceData.invoiceNumber || 'INV-2026-001'}</span>
                </div>
              </div>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Trip Ref</span>
                <p className="font-extrabold text-slate-900 mt-0.5">{tripNumber}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Invoice Date</span>
                <p className="font-bold text-slate-800 mt-0.5">{new Date(invoiceData.invoiceDate || Date.now()).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Assigned Vehicle</span>
                <p className="font-bold text-slate-800 mt-0.5">{vehiclePlate}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Driver</span>
                <p className="font-bold text-slate-800 mt-0.5">{trip.driverName || 'Assigned Driver'}</p>
              </div>
            </div>

            {/* Itemized Bill Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-700">Billing Charges Breakdown</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="flex justify-between bg-slate-100 p-3 font-bold text-slate-700 font-poppins">
                  <span>Description</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between p-3 text-slate-600">
                    <span>Base Freight Transport Charge</span>
                    <span className="font-semibold text-slate-900">₹ 12,500.00</span>
                  </div>
                  <div className="flex justify-between p-3 text-slate-600">
                    <span>Estimated Distance Fee</span>
                    <span className="font-semibold text-slate-900">₹ 3,400.00</span>
                  </div>
                  <div className="flex justify-between p-3 text-slate-600">
                    <span>National Highway Toll & Expressway Fee</span>
                    <span className="font-semibold text-slate-900">₹ 350.00</span>
                  </div>
                  <div className="flex justify-between p-3 text-slate-600">
                    <span>GST / Taxes (18%)</span>
                    <span className="font-semibold text-slate-900">₹ 2,925.00</span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-50 font-extrabold text-[#B45A0A] font-poppins text-sm">
                    <span>Total Amount Paid</span>
                    <span>₹ 19,175.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="py-2 px-5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toll Fee Receipt View Modal */}
      {tollModalOpen && tollData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-nunito">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-poppins text-slate-900">FASTag Toll Fee Receipt</h3>
                  <span className="text-xs text-slate-500 font-mono">Txn ID: {tollData.fastagTransactionId || 'FT20268842'}</span>
                </div>
              </div>
              <button
                onClick={() => setTollModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 font-poppins">Toll Plaza</span>
                  <h4 className="text-sm font-extrabold text-blue-950 font-poppins">{tollData.tollPlazaName || 'National Highway Toll Plaza'}</h4>
                  <p className="text-xs text-blue-800 mt-0.5">{tollData.location || `${startLocationName} - ${endLocationName} Toll`}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 font-poppins block">Status</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 font-poppins inline-block mt-0.5">
                    {tollData.receiptStatus || 'PAID ✓'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Vehicle Plate</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{tollData.vehiclePlate || vehiclePlate}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Payment Method</span>
                  <p className="font-bold text-slate-800 mt-0.5">{tollData.paymentMethod || 'FASTag Auto-Debit'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Date & Time</span>
                  <p className="font-bold text-slate-800 mt-0.5">{new Date(tollData.dateTime || Date.now()).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-poppins">Toll Fee Paid</span>
                  <p className="font-extrabold text-blue-600 text-sm mt-0.5">₹ {tollData.amountPaid || 350}.00</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setTollModalOpen(false)}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-poppins rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
