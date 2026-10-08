import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import FuelCard from "../components/FuelCard";
import { toast } from "react-hot-toast";
import { Fuel, Plus, X, RefreshCw, Lock } from "lucide-react";
import { fuelSchema, validateForm } from "@/validations";


export default function DriverFuelPage() {
  const [loading, setLoading] = useState(true);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [stationName, setStationName] = useState("");
  const [purchaseLocation, setPurchaseLocation] = useState("");
  const [odometerReading, setOdometerReading] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  // Field-level Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [assignedVehicle, setAssignedVehicle] = useState(null);

  const validateField = (field, value) => {
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

  const handleFieldChange = (field, value) => {
    if (field === "stationName") setStationName(value);
    if (field === "quantity") setQuantity(value);
    if (field === "totalCost") setTotalCost(value);
    if (field === "odometerReading") setOdometerReading(value);

    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleFieldBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const fields = {
      stationName,
      quantity,
      totalCost,
      odometerReading
    };
    const newErrors = {};
    let isValid = true;

    Object.keys(fields).forEach(key => {
      const err = validateField(key, fields[key]);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      stationName: true,
      quantity: true,
      totalCost: true,
      odometerReading: true
    });

    return isValid;
  };

  useEffect(() => {
    fetchFuelRecords();
    fetchActiveTrip();
    fetchAssignedVehicle();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      const res = await driverApi.getCurrentTrip();
      if (res?.success && res.data) {
        setActiveTrip(res.data);
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.warn("Failed to fetch active trip for fuel check:", err);
      setActiveTrip(null);
    }
  };

  const fetchAssignedVehicle = async () => {
    try {
      const res = await driverApi.getAssignedVehicle();
      if (res?.success && res.data) {
        setAssignedVehicle(res.data);
      } else {
        setAssignedVehicle(null);
      }
    } catch (err) {
      console.warn("Failed to fetch assigned vehicle for fuel check:", err);
      setAssignedVehicle(null);
    }
  };

  const fetchFuelRecords = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getFuelRecords();
      if (res?.success && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => {
          const tA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
          const tB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
          return tB - tA;
        });
        setFuelRecords(sorted);
      }
    } catch (err) {
      console.error("Error fetching fuel records:", err);
    } finally {
      setLoading(false);
    }
  };

  const vehObj = assignedVehicle?.vehicle || assignedVehicle;
  const isPermanentVehicleAssigned = Boolean(
    (assignedVehicle?.assigned && vehObj) ||
      (vehObj &&
        (vehObj._id || vehObj.id || vehObj.vehicleNumber) &&
        vehObj.vehicleNumber !== "Unassigned" &&
        vehObj.vehicleNumber !== "No Vehicle Assigned")
  );
  const isTripAvailable = Boolean(
    activeTrip &&
      !["cancelled", "rejected"].includes((activeTrip.status || "").toLowerCase())
  );
  const isFuelLogEnabled = isPermanentVehicleAssigned || isTripAvailable;

  const handleCreateFuelEntry = async (e) => {
    e.preventDefault();
    if (!isFuelLogEnabled) {
      toast.error("🔒 Fuel logging requires an assigned vehicle or an assigned trip!");
      return;
    }

    if (!validateAll()) {
      toast.error("Please fix all errors before submitting the fuel log entry.");
      return;
    }

    setSubmitting(true);
    try {
      const locVal = activeTrip?.destination || activeTrip?.location || activeTrip?.origin || purchaseLocation.trim() || stationName.trim() || 'GPS Station';
      const formData = new FormData();
      formData.append("quantity", quantity);
      formData.append("liters", quantity);
      formData.append("totalCost", totalCost);
      formData.append("amount", totalCost);
      formData.append("stationName", stationName);
      formData.append("fuelStation", stationName);
      formData.append("location", locVal);
      formData.append("city", locVal);
      formData.append("purchaseLocation", locVal);
      formData.append("fuelLocation", locVal);
      if (activeTrip?._id || activeTrip?.id) {
        formData.append("tripId", activeTrip._id || activeTrip.id);
      }
      if (odometerReading) {
        formData.append("odometerReading", odometerReading);
        formData.append("odometer", odometerReading);
      }
      if (receiptFile) formData.append("file", receiptFile);

      const res = await driverApi.createFuelEntry(formData);
      if (res?.success) {
        toast.success("Fuel log entry submitted successfully!");
        setShowModal(false);
        setQuantity("");
        setTotalCost("");
        setStationName("");
        setPurchaseLocation("");
        setOdometerReading("");
        setReceiptFile(null);
        setErrors({});
        setTouched({});
        fetchFuelRecords();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit fuel entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            <Fuel className="w-6 h-6 text-[#A14000]" />
            Fuel Log & Expense Records
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Submit fuel refilling receipts for manager approval and view past logs.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isFuelLogEnabled) {
              toast.error("🔒 Fuel logging requires an assigned vehicle or an active trip!");
              return;
            }
            setShowModal(true);
          }}
          disabled={!isFuelLogEnabled}
          title={
            !isFuelLogEnabled
              ? "Fuel logging disabled. Please ensure a vehicle is assigned or you have an active trip."
              : "Log fuel refill for your trip or vehicle"
          }
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-2 transition shadow-sm ${
            isFuelLogEnabled
              ? "bg-[#A14000] hover:bg-[#853400] text-white cursor-pointer"
              : "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
          }`}
        >
          {isFuelLogEnabled ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{isFuelLogEnabled ? "Log New Fuel Refill" : "Fuel Log Locked"}</span>
        </button>
      </div>

      {/* Lock Notice Banner if Fuel Log Disabled */}
      {!isFuelLogEnabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-[#A14000] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-poppins text-slate-900">🔒 Fuel Refill Logging Disabled</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Fuel refill logs are locked because no vehicle is currently assigned to you AND you have no active trip. Fuel logging requires an assigned vehicle or an active trip.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Cards Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#A14000] animate-spin" />
        </div>
      ) : fuelRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fuelRecords.map((record) => (
            <FuelCard key={record._id || record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Fuel className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-800 font-semibold font-poppins text-base">No Fuel Entries Logged Yet</h3>
          <p className="text-slate-500 text-xs mt-1">Click "Log New Fuel Refill" above to add your first receipt.</p>
        </div>
      )}

      {/* Modal: Create Fuel Entry */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl relative font-nunito">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-[#A14000]" /> Log Fuel Refill
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFuelEntry} className="space-y-4 mt-4" noValidate>
              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Station Name *</label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => handleFieldChange("stationName", e.target.value)}
                  onBlur={(e) => handleFieldBlur("stationName", e.target.value)}
                  placeholder="e.g. Bharat Petroleum / Indian Oil"
                  className={`mt-1 block w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors ${
                    touched.stationName && errors.stationName
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
                {touched.stationName && errors.stationName && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.stationName}</p>
                )}
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900 font-medium font-poppins">
                <span className="flex items-center gap-1.5 font-bold">
                  📍 Purchase Location:
                </span>
                <span className="text-slate-700 font-semibold font-mono text-[11px]">
                  {activeTrip?.destination || activeTrip?.location || activeTrip?.origin || "Auto-captured via GPS Telematics"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Liters (Quantity) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quantity}
                    onChange={(e) => handleFieldChange("quantity", e.target.value)}
                    onBlur={(e) => handleFieldBlur("quantity", e.target.value)}
                    placeholder="e.g. 120"
                    className={`mt-1 block w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors ${
                      touched.quantity && errors.quantity
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                    }`}
                  />
                  {touched.quantity && errors.quantity && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.quantity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Total Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalCost}
                    onChange={(e) => handleFieldChange("totalCost", e.target.value)}
                    onBlur={(e) => handleFieldBlur("totalCost", e.target.value)}
                    placeholder="e.g. 11400"
                    className={`mt-1 block w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors ${
                      touched.totalCost && errors.totalCost
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                    }`}
                  />
                  {touched.totalCost && errors.totalCost && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.totalCost}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Odometer Reading (km)</label>
                <input
                  type="number"
                  value={odometerReading}
                  onChange={(e) => handleFieldChange("odometerReading", e.target.value)}
                  onBlur={(e) => handleFieldBlur("odometerReading", e.target.value)}
                  placeholder="e.g. 45210"
                  className={`mt-1 block w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors ${
                    touched.odometerReading && errors.odometerReading
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
                {touched.odometerReading && errors.odometerReading && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.odometerReading}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Fuel Bill / Receipt Photo</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#A14000] hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold font-poppins rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-xl disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Save Fuel Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
