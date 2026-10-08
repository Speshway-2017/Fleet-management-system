import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import driverApi from "../api/driverApi";
import MapView from "../components/MapView";

const resolveDocumentUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  let backendBase = apiBase.replace("/api", "");
  
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    ) {
      backendBase = `http://${hostname}:5000`;
    }
  }
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
};
import { useDriverSocket } from "../hooks/useDriverSocket";
import { toast } from "react-hot-toast";
import {
  FileCheck,
  Scale,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  Play,
  Lock,
  UserCheck,
  User,
  MapPin,
  Navigation,
  CheckCircle,
  AlertCircle,
  FileText,
  Receipt,
  Printer,
  X,
  Download,
  Fuel
} from "lucide-react";
import { calculateDrivingRoute } from "../../manager/services/routingService";

export default function DriverTripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleBack = () => {
    if (location.state?.fromNotification || location.state?.from === "/driver/notifications") {
      navigate("/driver/notifications");
    } else {
      navigate("/driver/trips");
    }
  };
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

  const [showAddFuelModal, setShowAddFuelModal] = useState(false);
  const [submittingFuel, setSubmittingFuel] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    stationName: "",
    quantity: "",
    totalCost: "",
    odometerReading: "",
    purchaseLocation: ""
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [fuelErrors, setFuelErrors] = useState({});
  const [fuelTouched, setFuelTouched] = useState({});

  const validateFuelField = (field, value) => {
    switch (field) {
      case "stationName": {
        const val = (value || "").trim();
        if (!val) return "Station Name is required.";
        if (val.length < 2) return "Station Name must be at least 2 characters.";
        if (val.length > 50) return "Station Name cannot exceed 50 characters.";
        if (/\d/.test(val)) return "Station Name must contain valid text only (no numbers).";
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) return "Station Name contains invalid characters. Only letters and spaces are allowed.";
        if (/(.)\1{2,}/i.test(val)) return "Station Name cannot contain repeated characters.";
        const words = val.split(/\s+/).filter(Boolean);
        for (const w of words) {
          if (w.length >= 4 && !/[aeiouy]/i.test(w)) {
            return "Station Name contains meaningless text.";
          }
        }
        if (/^(asdf|qwer|zxcv|test|dummy|abc|xyz)/i.test(val.replace(/[\s.'-]+/g, ""))) {
          return "Station Name cannot be meaningless text.";
        }
        return "";
      }
      case "quantity": {
        const val = value !== undefined && value !== null ? String(value).trim() : "";
        if (!val) return "Liters (Quantity) is required.";
        if (!/^\d+(\.\d{1,2})?$/.test(val)) return "Please enter a valid positive numeric/decimal quantity (e.g. 45 or 45.5).";
        const num = Number(val);
        if (isNaN(num) || num <= 0) return "Quantity must be a positive number greater than 0.";
        if (num < 0.1) return "Quantity must be at least 0.1 liters.";
        if (num > 2000) return "Quantity cannot exceed 2,000 liters.";
        return "";
      }
      case "totalCost": {
        const val = value !== undefined && value !== null ? String(value).trim() : "";
        if (!val) return "Total Amount is required.";
        if (!/^\d+(\.\d{1,2})?$/.test(val)) return "Please enter a valid positive numeric/decimal amount in ₹ (e.g. 4500 or 4500.50).";
        const num = Number(val);
        if (isNaN(num) || num <= 0) return "Total amount must be a positive value greater than 0.";
        if (num < 1) return "Total amount must be at least ₹1.";
        if (num > 300000) return "Total amount cannot exceed ₹3,00,000.";
        return "";
      }
      case "odometerReading": {
        const val = value !== undefined && value !== null ? String(value).trim() : "";
        if (!val) return "";
        if (!/^\d+(\.\d{1,2})?$/.test(val)) return "Odometer reading must be a valid positive number.";
        const num = Number(val);
        if (isNaN(num) || num < 0) return "Odometer reading must be a positive number.";
        if (num > 2000000) return "Odometer reading cannot exceed 20,00,000 km.";
        return "";
      }
      default:
        return "";
    }
  };

  const handleFuelFieldChange = (field, value) => {
    setFuelForm(prev => ({ ...prev, [field]: value }));
    setFuelTouched(prev => ({ ...prev, [field]: true }));
    const err = validateFuelField(field, value);
    setFuelErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleFuelFieldBlur = (field, value) => {
    setFuelTouched(prev => ({ ...prev, [field]: true }));
    const err = validateFuelField(field, value);
    setFuelErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleOpenAddFuelModal = () => {
    setFuelErrors({});
    setFuelTouched({});
    setShowAddFuelModal(true);
  };

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
      if (id) {
        const res = await driverApi.getTripById(id);
        if (res?.success && res.data) {
          setTrip(res.data);
          return;
        }
      }

      const res = await driverApi.getTrips();
      if (res?.success && Array.isArray(res.data)) {
        const found = res.data.find(
          t => (t._id || t.id || t.tripId) === id || String(t._id || t.id || t.tripId) === String(id)
        );
        if (found) {
          setTrip(found);
          return;
        }
      }

      const curRes = await driverApi.getCurrentTrip();
      if (curRes?.success && curRes.data) {
        setTrip(curRes.data);
      } else {
        toast.error("Trip not found");
      }
    } catch (err) {
      console.error("Error fetching trip details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFuelSubmit = async (e) => {
    e.preventDefault();
    const stationErr = validateFuelField("stationName", fuelForm.stationName);
    const qtyErr = validateFuelField("quantity", fuelForm.quantity);
    const costErr = validateFuelField("totalCost", fuelForm.totalCost);
    const odoErr = validateFuelField("odometerReading", fuelForm.odometerReading);

    setFuelTouched({
      stationName: true,
      quantity: true,
      totalCost: true,
      odometerReading: true
    });
    setFuelErrors({
      stationName: stationErr,
      quantity: qtyErr,
      totalCost: costErr,
      odometerReading: odoErr
    });

    if (stationErr || qtyErr || costErr || odoErr) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    try {
      setSubmittingFuel(true);
      const locVal = trip?.destination || trip?.location || trip?.endLocation || trip?.origin || fuelForm.purchaseLocation.trim() || fuelForm.stationName.trim() || 'GPS Station';
      
      const formData = new FormData();
      formData.append("quantity", fuelForm.quantity);
      formData.append("liters", fuelForm.quantity);
      formData.append("totalCost", fuelForm.totalCost);
      formData.append("amount", fuelForm.totalCost);
      formData.append("stationName", fuelForm.stationName);
      formData.append("fuelStation", fuelForm.stationName);
      formData.append("location", locVal);
      formData.append("city", locVal);
      formData.append("purchaseLocation", locVal);
      formData.append("fuelLocation", locVal);
      formData.append("tripId", tripId);
      
      if (fuelForm.odometerReading) {
        formData.append("odometerReading", fuelForm.odometerReading);
        formData.append("odometer", fuelForm.odometerReading);
      }
      
      if (receiptFile) {
        formData.append("file", receiptFile);
      }

      const res = await driverApi.createFuelEntry(formData);
      if (res?.success) {
        toast.success("Fuel log entry submitted successfully!");
        setShowAddFuelModal(false);
        setFuelForm({
          stationName: "",
          quantity: "",
          totalCost: "",
          odometerReading: "",
          purchaseLocation: ""
        });
        setReceiptFile(null);
        setFuelErrors({});
        setFuelTouched({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit fuel entry");
    } finally {
      setSubmittingFuel(false);
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
    if (!tripId || updatingStatus) return;

    const isDeliveryStep = ["Delivered", "Completed", "Complete Trip"].includes(newStatus);
    if (isDeliveryStep && !isDocsUploaded) {
      toast.error("🔒 Cannot set status to " + newStatus + ". Please upload BOTH Proof of Delivery (POD) and Weighbridge Slip first.");
      return;
    }

    try {
      setUpdatingStatus(true);
      const res = await driverApi.updateTripStatus(tripId, { status: newStatus });
      if (res?.success) {
        toast.success(`Trip status updated to: ${newStatus === "Start Trip" ? "In Progress" : newStatus}`);
        fetchTripDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update trip status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleCustomerLocation = async () => {
    if (!tripId) return;
    if (!isTripStarted) {
      toast.error("🔒 Location arrival toggle is read-only until the trip is started. Please start the trip first.");
      return;
    }
    if (isCompleted) {
      toast.error("Trip is already completed and read-only.");
      return;
    }
    const previousState = trip.customerLocationReached;
    const newReachedState = !previousState;

    // Optimistic UI update for instant (0ms delay) response
    setTrip(prev => ({
      ...prev,
      customerLocationReached: newReachedState,
      customerLocationReachedAt: newReachedState ? new Date().toISOString() : null
    }));

    setTogglingLocation(true);
    try {
      const res = await driverApi.toggleCustomerLocation(tripId, { reached: newReachedState });
      if (res?.success) {
        toast.success(
          newReachedState
            ? "📍 Customer location reached! Document uploads unlocked."
            : "Customer location status reset."
        );
        fetchTripDetails();
      }
    } catch (err) {
      setTrip(prev => ({ ...prev, customerLocationReached: previousState }));
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
        const uploadedUrl = res.data?.pod?.podDocumentUrl || res.data?.pod?.deliveryPhotoUrl || res.data?.trip?.podUrl || res.data?.trip?.proofOfDelivery?.url;
        if (uploadedUrl) {
          setTrip(prev => ({
            ...prev,
            podStatus: "Uploaded",
            podUploaded: true,
            podUrl: uploadedUrl,
            proofOfDelivery: {
              ...(prev?.proofOfDelivery || {}),
              url: uploadedUrl,
              podDocumentUrl: uploadedUrl,
              status: "Uploaded"
            }
          }));
        }
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
        const uploadedUrl = res.data?.slip?.documentUrl || res.data?.trip?.weighbridgeUrl || res.data?.trip?.weighbridgeSlip?.url;
        if (uploadedUrl) {
          setTrip(prev => ({
            ...prev,
            weighbridgeStatus: "Uploaded",
            weighbridgeUploaded: true,
            weighbridgeUrl: uploadedUrl,
            weighbridgeSlip: {
              ...(prev?.weighbridgeSlip || {}),
              url: uploadedUrl,
              documentUrl: uploadedUrl,
              status: "Uploaded"
            }
          }));
        }
        fetchTripDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload Weighbridge slip");
    } finally {
      setUploadingWeighbridge(false);
    }
  };



  if (!trip) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm font-poppins space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Trip Not Found</h2>
        <p className="text-slate-500 text-xs">The requested trip ID could not be loaded or does not exist.</p>
        <button
          onClick={() => navigate("/driver/trips")}
          className="px-5 py-2.5 bg-[#A14000] text-white font-bold rounded-xl text-xs"
        >
          Return to Trips
        </button>
      </div>
    );
  }

  const rawPodUrl = (trip.podUrl || trip.proofOfDelivery?.url || trip.proofOfDelivery?.podDocumentUrl || trip.proofOfDelivery?.deliveryPhotoUrl || trip.podDetails?.podDocumentUrl || trip.podDetails?.url || "").trim();
  const hasRealPod = Boolean(rawPodUrl && !rawPodUrl.includes("unsplash.com") && !rawPodUrl.includes("via.placeholder.com") && (trip.podUploaded || trip.podStatus === "Uploaded" || trip.podStatus === "Approved" || trip.podStatus === "Rejected" || trip.proofOfDelivery?.status === "Rejected"));

  const rawWbUrl = (trip.weighbridgeUrl || trip.weighbridgeSlip?.url || trip.weighbridgeSlip?.documentUrl || trip.weighbridgeDetails?.documentUrl || trip.weighbridgeDetails?.url || "").trim();
  const hasRealWb = Boolean(rawWbUrl && !rawWbUrl.includes("unsplash.com") && !rawWbUrl.includes("via.placeholder.com") && (trip.weighbridgeUploaded || trip.weighbridgeStatus === "Uploaded" || trip.weighbridgeStatus === "Approved" || trip.weighbridgeStatus === "Rejected" || trip.weighbridgeSlip?.status === "Rejected"));

  const tripNumber = trip.tripNumber || (typeof trip.tripId === 'string' && trip.tripId.startsWith('TRIP') ? trip.tripId : `TRIP-${String(tripId).slice(-6)}`);
  const rawStatus = (trip.status || "DISPATCHED").toUpperCase();
  const departureTime = trip.departureTime || trip.scheduledDate;

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
      
      console.log(`[TripDetails Start Validation]`, {
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
  const vehiclePlate = vehicleObj?.vehicleNumber || vehicleObj?.registrationNumber || trip.vehiclePlate || (typeof trip.vehicle === 'string' ? trip.vehicle : 'Assigned Truck');
  const vehicleModel = vehicleObj?.vehicleModel || vehicleObj?.model || trip.vehicleName || 'Fleet Heavy Transport';
  const vehicleStatus = vehicleObj?.currentStatus || 'On Trip';
  const vehicleFuel = vehicleObj?.fuelLevel ? `${vehicleObj.fuelLevel}%` : '88%';

  const getFormattedAddress = (addrObj, defaultLocString = '', isPickup = true) => {
    if (!addrObj) {
      let rawMobile = '';
      if (isPickup) {
        rawMobile = trip?.senderPhone || trip?.pickupPhone || '';
      } else {
        rawMobile = trip?.receiverPhone || trip?.deliveryPhone || trip?.proofOfDelivery?.customerPhone || trip?.proofOfDelivery?.receiverPhone || '';
      }
      const mobile = rawMobile ? (rawMobile.startsWith('+91') ? rawMobile : `+91 ${rawMobile}`) : 'N/A';
      return { companyName: defaultLocString || '', contactPerson: 'N/A', mobile, streetAddress: '', city: defaultLocString || 'N/A', state: 'N/A', pincode: '' };
    }
    const company = addrObj.companyName || (defaultLocString ? `${defaultLocString} Hub` : '');
    const street = addrObj.streetAddress || addrObj.street || addrObj.formattedAddress || '';
    const contactPerson = addrObj.contactPerson || 'N/A';
    let rawMobile = addrObj.mobile || addrObj.mobileNumber || addrObj.contactPhone || '';
    if (!rawMobile) {
      if (isPickup) {
        rawMobile = trip?.senderPhone || trip?.pickupPhone || '';
      } else {
        rawMobile = trip?.receiverPhone || trip?.deliveryPhone || trip?.proofOfDelivery?.customerPhone || trip?.proofOfDelivery?.receiverPhone || '';
      }
    }
    const mobile = rawMobile ? (rawMobile.startsWith('+91') ? rawMobile : `+91 ${rawMobile}`) : 'N/A';
    const city = addrObj.city || defaultLocString || 'N/A';
    const state = addrObj.state || 'N/A';
    const pincode = addrObj.pincode || addrObj.zipCode || '';
    return {
      companyName: company,
      contactPerson,
      mobile,
      streetAddress: street,
      city,
      state,
      pincode
    };
  };

  const pickupAddr = getFormattedAddress(trip.pickupAddress || trip.fromAddress, trip.startLocation, true);
  const deliveryAddr = getFormattedAddress(trip.deliveryAddress || trip.toAddress, trip.endLocation, false);

  const customerReached = Boolean(trip.customerLocationReached);

  const normStatus = rawStatus.replace(/_/g, " ").trim();
  const isPending = normStatus === "ASSIGNED" || normStatus === "PENDING" || normStatus === "PENDING DRIVER ACCEPTANCE";
  const isCompleted = normStatus === "COMPLETED" || normStatus === "DELIVERED" || normStatus === "REJECTED" || normStatus === "CANCELLED";

  const unstartedStatuses = [
    "ASSIGNED",
    "PENDING",
    "PENDING DRIVER ACCEPTANCE",
    "SCHEDULED",
    "ACCEPTED",
    "READY TO DISPATCH",
    "UPCOMING"
  ];
  const isTripStarted = !unstartedStatuses.includes(normStatus) && (Boolean(trip.actualStartTime) || currentStageIndex >= 0 || !isPending);

  return (
    <div className="space-y-6 font-nunito pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold font-poppins text-slate-900">{tripNumber}</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border font-poppins ${
              isCompleted 
                ? "bg-slate-100 text-slate-700 border-slate-200" 
                : isPending 
                ? "bg-amber-50 text-amber-700 border-amber-200" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {rawStatus} {isCompleted ? "(Read Only)" : ""}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Scheduled Departure: {departureTime ? new Date(departureTime).toLocaleString() : "Today"}
          </p>
        </div>

        {/* Action Header for Pending Trips */}
        {isPending && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRespond("accept")}
              className="py-2.5 px-5 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Trip
            </button>
            <button
              onClick={() => handleRespond("reject")}
              className="py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 font-semibold font-poppins rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}

        {/* Action Header for Completed Trips (Read Only) */}
        {isCompleted && (
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 bg-slate-100 text-slate-700 font-bold font-poppins rounded-xl text-xs flex items-center gap-2 border border-slate-200">
              <Lock className="w-4 h-4 text-slate-500" /> Completed Trip (Read Only)
            </span>
          </div>
        )}

        {/* Action Header for Upcoming Accepted Trips */}
        {(rawStatus === "ACCEPTED" || rawStatus === "SCHEDULED" || rawStatus === "UPCOMING") && (
          <div className="flex flex-col sm:items-end gap-1">
            <button
              onClick={() => handleStatusChange("Start Trip")}
              disabled={!isStartEnabled || updatingStatus}
              className={`py-2.5 px-6 rounded-xl text-xs font-bold font-poppins flex items-center gap-2 transition shadow-sm ${(isStartEnabled && !updatingStatus)
                ? "bg-[#A14000] hover:bg-[#853400] text-white cursor-pointer"
                : "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                }`}
            >
              {updatingStatus ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full"></span> Starting...
                </>
              ) : isStartEnabled ? (
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
      <div className={`border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 ${
        !isTripStarted
          ? "bg-slate-50/90 border-slate-200"
          : isCompleted
          ? "bg-slate-50 border-slate-200"
          : customerReached
          ? "bg-gradient-to-r from-emerald-50/90 to-emerald-100/40 border-emerald-200"
          : "bg-gradient-to-r from-amber-50/90 to-amber-100/40 border-amber-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${
            !isTripStarted
              ? "bg-slate-200 text-slate-500 shadow-sm"
              : isCompleted
              ? "bg-slate-400 text-white shadow-sm"
              : customerReached
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-amber-100 text-[#A14000]"
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-poppins text-slate-900">Arrived at Customer Location</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-poppins ${
                !isTripStarted
                  ? "bg-slate-200 text-slate-600 border border-slate-300"
                  : isCompleted
                  ? "bg-slate-200 text-slate-700 border border-slate-300"
                  : customerReached
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-200 text-amber-900 border border-amber-300"
              }`}>
                {!isTripStarted
                  ? "READ ONLY (START TRIP FIRST)"
                  : isCompleted
                  ? "TRIP COMPLETED"
                  : customerReached
                  ? "CUSTOMER REACHED"
                  : "EN ROUTE TO CUSTOMER"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {!isTripStarted
                ? "🔒 Location arrival toggle is read-only until the trip is started. Please click 'Start Trip' to begin your journey."
                : isCompleted
                ? "✓ Trip is completed and finalized. Location arrival status is read-only."
                : customerReached
                ? "✓ Driver arrived at destination. Proof of Delivery (POD) & Weighbridge uploads are unlocked!"
                : "Toggle switch ON when you reach the destination to automatically unlock POD & Weighbridge uploads."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold font-poppins text-slate-700">
            {!isTripStarted ? "Not Started (Read Only)" : isCompleted ? "Completed" : customerReached ? "Reached" : "Not Reached"}
          </span>
          <label className={`relative inline-flex items-center shrink-0 ${!isTripStarted || isCompleted ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              checked={customerReached}
              onChange={handleToggleCustomerLocation}
              disabled={!isTripStarted || togglingLocation || isCompleted}
              className="sr-only peer"
            />
            <div className={`w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
              !isTripStarted || isCompleted ? "peer-checked:bg-slate-400 cursor-not-allowed" : "peer-checked:bg-emerald-600"
            }`}></div>
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
              <span className="text-xs font-semibold text-[#A14000] lowercase font-nunito">live route gps</span>
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

          {/* Cargo Specs (Moved from Sidebar) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider">Trip Specs & Cargo Info</h3>
              <span className="text-xs font-semibold text-[#A14000] uppercase font-poppins tracking-wider">Specs</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
              <div className="flex-1 min-w-[120px] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-poppins block">Cargo Type</span>
                <p className="text-sm font-bold text-slate-800">{trip.cargoType || "Standard Freight"}</p>
              </div>
              <div className="flex-1 min-w-[120px] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-poppins block">Weight</span>
                <p className="text-sm font-bold text-slate-800">
                  {(trip.cargoWeight !== undefined && trip.cargoWeight !== null) ? `${trip.cargoWeight} kg` : (trip.weight ? `${trip.weight} Tons` : "N/A")}
                </p>
              </div>
              <div className="flex-1 min-w-[120px] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-poppins block">Departure Time</span>
                <p className="text-sm font-bold text-slate-800">
                  {trip.departureTime ? new Date(trip.departureTime).toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>
              <div className="flex-1 min-w-[120px] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-poppins block">ETA</span>
                <p className="text-sm font-bold text-slate-800">
                  {trip.eta ? new Date(trip.eta).toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>
              <div className="flex-1 min-w-[100px] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-poppins block">Distance</span>
                <p className="text-sm font-bold text-slate-800">
                  {trip.estimatedDistance || trip.distance ? `${trip.estimatedDistance || trip.distance} km` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Address Details (Horizontal Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-nunito min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-poppins block mb-1">Pickup / From Address</span>
                {pickupAddr.companyName && <p className="font-bold text-[#A14000] break-words">{pickupAddr.companyName}</p>}
                {pickupAddr.streetAddress && <p className="text-slate-600 font-semibold break-words">{pickupAddr.streetAddress}</p>}
                <p className="text-slate-500 font-bold break-words">{pickupAddr.city}, {pickupAddr.state}{(!pickupAddr.streetAddress && pickupAddr.pincode) ? ` - ${pickupAddr.pincode}` : ''}</p>
                {pickupAddr.streetAddress && pickupAddr.pincode && <p className="text-xs text-slate-500 font-semibold">Pincode: {pickupAddr.pincode}</p>}
                <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1 font-sans break-words">Contact: {pickupAddr.contactPerson} ({pickupAddr.mobile})</p>
              </div>
              <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-nunito min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-poppins block mb-1">Destination / To Address</span>
                {deliveryAddr.companyName && <p className="font-bold text-[#A14000] break-words">{deliveryAddr.companyName}</p>}
                {deliveryAddr.streetAddress && <p className="text-slate-600 font-semibold break-words">{deliveryAddr.streetAddress}</p>}
                <p className="text-slate-500 font-bold break-words">{deliveryAddr.city}, {deliveryAddr.state}{(!deliveryAddr.streetAddress && deliveryAddr.pincode) ? ` - ${deliveryAddr.pincode}` : ''}</p>
                {deliveryAddr.streetAddress && deliveryAddr.pincode && <p className="text-xs text-slate-500 font-semibold">Pincode: {deliveryAddr.pincode}</p>}
                <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1 font-sans break-words">Contact: {deliveryAddr.contactPerson} ({deliveryAddr.mobile})</p>
              </div>
            </div>

            {(trip.tripNotes || trip.description) && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-poppins block mb-1">Trip Notes</span>
                <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-nunito break-words">{trip.tripNotes || trip.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Vehicle Details & Dynamic Document Uploads & Real Bills */}
        <div className="space-y-6">
          {/* Real Generated Bills Section (Unlocked after Trip Completion) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Trip Invoices & Toll Bills</span>
            </h3>

            {(trip?.status || "").toUpperCase() === "COMPLETED" || (customerReached && (hasRealPod || hasRealWb)) ? (
              <div className="space-y-3">
                {/* Invoice Bill View Card */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-[#A14000]">
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
                    className="px-3 py-1.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loadingBill ? "Loading..." : "View Invoice"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-slate-700 font-poppins">🔒 Invoice Locked</p>
                <p className="text-[11px] text-slate-500">
                  Invoice bill and FASTag toll receipt will be available once customer location is reached and POD / Weighbridge documents are uploaded.
                </p>
              </div>
            )}
          </div>

          {/* Driver Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#A14000]" /> Assigned Driver Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Driver Name:</span>
                <span className="font-bold text-slate-800 break-words text-right">{trip.driverName || trip.driver?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Employee ID:</span>
                <span className="font-bold text-slate-800 font-mono break-words text-right">{trip.driver?.employeeId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Mobile Number:</span>
                <span className="font-bold text-slate-800 break-words text-right">{trip.driverPhone || trip.driver?.phoneNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#A14000]" /> Assigned Vehicle Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Plate / Registration:</span>
                <span className="font-extrabold font-mono text-slate-900 break-words text-right">{vehiclePlate}</span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Vehicle Model:</span>
                <span className="font-bold text-slate-800 break-words text-right">{vehicleModel}</span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Vehicle Status:</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-poppins shrink-0">
                  {vehicleStatus}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/driver/vehicles", { state: { tab: "documents" } })}
              className="mt-3.5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#A14000] dark:bg-[#1E293B] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> View Vehicle Documents
            </button>
            {(() => {
              const statusLower = trip?.status?.toLowerCase() || "";
              const isActiveTrip = statusLower !== "completed" && statusLower !== "cancelled" && statusLower !== "rejected";
              return isActiveTrip && (
                <button
                  onClick={handleOpenAddFuelModal}
                  className="mt-2 w-full py-2 bg-[#059669] hover:bg-[#047857] text-white border border-transparent font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Fuel className="w-3.5 h-3.5" /> Add Fuel Log
                </button>
              );
            })()}
          </div>



          {/* Proof of Delivery (POD) & Weighbridge Upload Forms */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold font-poppins text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Trip Documents Upload</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-poppins font-bold ${isCompleted ? "bg-slate-100 text-slate-700" : (trip.status === "Documents Rejected" || trip.podStatus === "Rejected" || trip.weighbridgeStatus === "Rejected") ? "bg-red-100 text-red-700 border border-red-200" : customerReached ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                {isCompleted ? "READ ONLY 🔒" : (trip.status === "Documents Rejected" || trip.podStatus === "Rejected" || trip.weighbridgeStatus === "Rejected") ? "CORRECTION REQUIRED ⚠️" : customerReached ? "UNLOCKED 🔓" : "LOCKED 🔒"}
              </span>
            </h3>

            {((trip.status === "Documents Rejected") || (trip.podStatus === "Rejected") || (trip.weighbridgeStatus === "Rejected") || trip.proofOfDelivery?.status === "Rejected" || trip.weighbridgeSlip?.status === "Rejected") && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Documents Rejected by Manager</span>
                </div>
                <p className="text-red-600 pl-5 text-[11px]">
                  {trip.rejectionReason || trip.proofOfDelivery?.rejectionReason || trip.weighbridgeSlip?.rejectionReason || "Uploaded documents require correction. Please select and upload corrected documents below."}
                </p>
              </div>
            )}

            {isCompleted && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                🔒 Document uploads are locked because this trip is completed and read-only.
              </p>
            )}

            {/* POD Upload Box */}
            <form onSubmit={handlePodUpload} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 font-poppins flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#A14000]" /> Proof of Delivery (POD)
                </label>
                <div className="flex items-center gap-2">
                  {customerReached && hasRealPod && (
                    <button
                      type="button"
                      onClick={async () => {
                        let url = rawPodUrl;
                        if (!url) {
                          try {
                            const res = await driverApi.getTripById(trip._id || tripId);
                            url = res?.data?.podUrl || res?.data?.proofOfDelivery?.url || res?.data?.podDetails?.podDocumentUrl;
                          } catch (err) {
                            console.warn("Failed to fetch POD URL:", err);
                          }
                        }
                        if (url && !url.includes("unsplash.com") && !url.includes("via.placeholder.com")) {
                          window.open(resolveDocumentUrl(url), "_blank");
                        } else {
                          toast.error("No valid POD document uploaded yet.");
                        }
                      }}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-amber-100 text-[#A14000] hover:bg-amber-200 transition font-poppins cursor-pointer"
                    >
                      View POD
                    </button>
                  )}
                  {(trip.podStatus === "Rejected" || trip.proofOfDelivery?.status === "Rejected") ? (
                    <span className="text-[10px] text-red-600 font-extrabold font-poppins bg-red-50 px-2 py-0.5 rounded border border-red-200">Rejected ❌</span>
                  ) : hasRealPod ? (
                    <span className="text-[10px] text-emerald-600 font-extrabold font-poppins">Uploaded ✓</span>
                  ) : null}
                </div>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={!customerReached || uploadingPod || isCompleted}
                onChange={(e) => setPodFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#A14000] hover:file:bg-amber-100 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!customerReached || !podFile || uploadingPod || isCompleted}
                className="w-full py-2 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
              >
                {uploadingPod ? "Uploading POD..." : (trip.podStatus === "Rejected" || trip.proofOfDelivery?.status === "Rejected") ? "Re-upload POD Document" : "Upload POD Document"}
              </button>
            </form>

            <hr className="border-slate-100" />

            {/* Weighbridge Upload Box */}
            <form onSubmit={handleWeighbridgeUpload} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 font-poppins flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" /> Weighbridge Slip
                </label>
                <div className="flex items-center gap-2">
                  {customerReached && hasRealWb && (
                    <button
                      type="button"
                      onClick={async () => {
                        let url = rawWbUrl;
                        if (!url) {
                          try {
                            const res = await driverApi.getTripById(trip._id || tripId);
                            url = res?.data?.weighbridgeUrl || res?.data?.weighbridgeSlip?.url || res?.data?.weighbridgeDetails?.documentUrl;
                          } catch (err) {
                            console.warn("Failed to fetch Weighbridge URL:", err);
                          }
                        }
                        if (url && !url.includes("unsplash.com") && !url.includes("via.placeholder.com")) {
                          window.open(resolveDocumentUrl(url), "_blank");
                        } else {
                          toast.error("No valid Weighbridge slip uploaded yet.");
                        }
                      }}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition font-poppins cursor-pointer"
                    >
                      View Weighbridge
                    </button>
                  )}
                  {(trip.weighbridgeStatus === "Rejected" || trip.weighbridgeSlip?.status === "Rejected") ? (
                    <span className="text-[10px] text-red-600 font-extrabold font-poppins bg-red-50 px-2 py-0.5 rounded border border-red-200">Rejected ❌</span>
                  ) : hasRealWb ? (
                    <span className="text-[10px] text-emerald-600 font-extrabold font-poppins">Uploaded ✓</span>
                  ) : null}
                </div>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={!customerReached || uploadingWeighbridge || isCompleted}
                onChange={(e) => setWeighbridgeFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!customerReached || !weighbridgeFile || uploadingWeighbridge || isCompleted}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
              >
                {uploadingWeighbridge ? "Uploading Weighbridge..." : (trip.weighbridgeStatus === "Rejected" || trip.weighbridgeSlip?.status === "Rejected") ? "Re-upload Weighbridge Slip" : "Upload Weighbridge Slip"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Fuel Entry Modal */}
      {showAddFuelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200 relative animate-scale-up">
            <button
              onClick={() => setShowAddFuelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                <Fuel className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Fuel Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Log fuel purchase details for this active trip.</p>
              </div>
            </div>

            <form onSubmit={handleAddFuelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-1">
                  Fuel Station Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shell Petrol Pump, Bengaluru"
                  value={fuelForm.stationName}
                  onChange={(e) => handleFuelFieldChange("stationName", e.target.value)}
                  onBlur={(e) => handleFuelFieldBlur("stationName", e.target.value)}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-slate-900 focus:outline-none transition-all ${
                    fuelTouched.stationName && fuelErrors.stationName
                      ? "border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
                {fuelTouched.stationName && fuelErrors.stationName && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1 font-poppins flex items-center gap-1">
                    • {fuelErrors.stationName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-1">
                    Liters (Quantity) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    max="2000"
                    step="0.01"
                    placeholder="e.g. 50"
                    value={fuelForm.quantity}
                    onChange={(e) => handleFuelFieldChange("quantity", e.target.value)}
                    onBlur={(e) => handleFuelFieldBlur("quantity", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-slate-900 focus:outline-none transition-all ${
                      fuelTouched.quantity && fuelErrors.quantity
                        ? "border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                    }`}
                  />
                  {fuelTouched.quantity && fuelErrors.quantity && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 font-poppins flex items-center gap-1">
                      • {fuelErrors.quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-1">
                    Total Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="300000"
                    step="0.01"
                    placeholder="e.g. 5000"
                    value={fuelForm.totalCost}
                    onChange={(e) => handleFuelFieldChange("totalCost", e.target.value)}
                    onBlur={(e) => handleFuelFieldBlur("totalCost", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-slate-900 focus:outline-none transition-all ${
                      fuelTouched.totalCost && fuelErrors.totalCost
                        ? "border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                    }`}
                  />
                  {fuelTouched.totalCost && fuelErrors.totalCost && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 font-poppins flex items-center gap-1">
                      • {fuelErrors.totalCost}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-1">
                    Odometer (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2000000"
                    placeholder="e.g. 12450"
                    value={fuelForm.odometerReading}
                    onChange={(e) => handleFuelFieldChange("odometerReading", e.target.value)}
                    onBlur={(e) => handleFuelFieldBlur("odometerReading", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-slate-900 focus:outline-none transition-all ${
                      fuelTouched.odometerReading && fuelErrors.odometerReading
                        ? "border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                    }`}
                  />
                  {fuelTouched.odometerReading && fuelErrors.odometerReading && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 font-poppins flex items-center gap-1">
                      • {fuelErrors.odometerReading}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-1">
                    Purchase City (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={fuelForm.purchaseLocation}
                    onChange={(e) => setFuelForm({ ...fuelForm, purchaseLocation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-1">
                  Receipt Slip / Bill File (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#A14000] hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFuelModal(false)}
                  disabled={submittingFuel}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFuel}
                  className="px-4 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingFuel ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Save Log
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Bill View Modal */}
      {invoiceModalOpen && invoiceData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto font-nunito">
          <div className="bg-white rounded-xl max-w-md w-full p-4.5 shadow-2xl space-y-3.5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-[#A14000] rounded-lg shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold font-poppins text-slate-900 leading-tight">Trip Freight Invoice</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Invoice #: {invoiceData.invoiceNumber || 'INV-2026-001'}</span>
                </div>
              </div>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trip Summary Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-poppins block">Trip Ref</span>
                <p className="font-extrabold text-slate-900 mt-0.5 truncate">{tripNumber}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-poppins block">Invoice Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{new Date(invoiceData.invoiceDate || Date.now()).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-poppins block">Vehicle</span>
                <p className="font-semibold text-slate-800 mt-0.5 truncate">{vehiclePlate}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-poppins block">Driver</span>
                <p className="font-semibold text-slate-800 mt-0.5 truncate">{trip.driverName || 'Assigned Driver'}</p>
              </div>
            </div>

            {/* Itemized Bill Table */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold font-poppins uppercase tracking-wider text-slate-600">Billing Charges Breakdown</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                <div className="flex justify-between bg-slate-100 px-2.5 py-1.5 font-bold text-slate-700 font-poppins text-[10px]">
                  <span>Description</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                    <span>Base Freight Transport</span>
                    <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.freightCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {Boolean(invoiceData.charges?.serviceFee) && (
                    <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                      <span>Service Fee ({trip.serviceType?.split(' ')[0] || 'Standard'})</span>
                      <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.serviceFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Boolean(invoiceData.charges?.loadingCharges) && (
                    <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                      <span>Loading & Handling Charges</span>
                      <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.loadingCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Boolean(invoiceData.charges?.unloadingCharges) && (
                    <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                      <span>Unloading Charges</span>
                      <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.unloadingCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Boolean(invoiceData.charges?.fuelCharges) && (
                    <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                      <span>Fuel Charges</span>
                      <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.fuelCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Boolean(invoiceData.charges?.tollCharges) && (
                    <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                      <span>National Highway Toll & Expressway Fee</span>
                      <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.tollCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-2.5 py-1.5 text-slate-600">
                    <span>GST / Taxes (18%)</span>
                    <span className="font-semibold text-slate-900">₹ {(invoiceData.charges?.gstTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between px-2.5 py-2 bg-amber-50 font-bold text-[#A14000] font-poppins text-xs">
                    <span>Total Amount</span>
                    <span>₹ {(invoiceData.charges?.totalAmount || invoiceData.charges?.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-poppins rounded-lg text-[11px] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="py-1.5 px-4 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-lg text-[11px] transition cursor-pointer"
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
