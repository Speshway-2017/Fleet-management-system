import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Save, FileText, Calendar, Zap, Upload, Check, X, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { vehicleApi } from "@/api/vehicleApi";
import { driverApi } from "@/api/driverApi";

// Defined at module level so useCallback never captures a stale reference
const DUPLICATE_FIELDS = {
  plateNumber:        'vehicleNumber',
  registrationNumber: 'registrationNumber',
  chassisNumber:      'chassisNumber',
};


export default function VehicleEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicleDocs, setVehicleDocs] = useState({
    rc: null,
    insurance: null,
    puc: null,
    fitness: null,
    permit: null,
    roadTax: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({});
  const [validatingFields, setValidatingFields] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({
    rc: false,
    insurance: false,
    puc: false,
    fitness: false,
    permit: false,
    roadTax: false
  });
  const [docErrors, setDocErrors] = useState({
    rc: "",
    insurance: "",
    puc: "",
    fitness: "",
    permit: "",
    roadTax: ""
  });

  // Debounce timers (one per field)
  const debounceTimers = useRef({});


  const checkFieldDuplicate = useCallback(async (formField, value) => {
    const backendField = DUPLICATE_FIELDS[formField];
    if (!backendField || !value || String(value).trim() === '') {
      setDuplicateErrors(prev => ({ ...prev, [formField]: '' }));
      return;
    }
    setValidatingFields(prev => ({ ...prev, [formField]: true }));
    try {
      const res = await vehicleApi.checkDuplicate(backendField, value.trim(), id);
      const isDuplicate = res.data?.data?.isDuplicate;
      setDuplicateErrors(prev => ({
        ...prev,
        [formField]: isDuplicate ? 'Already exists.' : '',
      }));
    } catch (err) {
      // Log API errors during real-time check so they're visible in devtools
      console.warn('[DuplicateCheck] API error:', err?.response?.status, err?.response?.data?.message || err?.message);
    } finally {
      setValidatingFields(prev => ({ ...prev, [formField]: false }));
    }
  }, [id]);

  const hasDuplicateErrors = Object.values(duplicateErrors).some(Boolean);

  useEffect(() => {
    const loadVehicleAndDrivers = async () => {
      try {
        setLoading(true);
        const [vehRes, drvRes] = await Promise.all([
          vehicleApi.getById(id),
          driverApi.list()
        ]);
        const found = vehRes.data?.data;
        const rawDrivers = drvRes.data?.data ?? [];
        setDrivers(rawDrivers);
        if (found) {
          setVehicle(found);
          setFormData({
            ...found,
            name: found.vehicleName || `${found.brand} ${found.model}`,
            manufacturer: found.brand || "",
            plateNumber: found.vehicleNumber || "",
            type: found.vehicleType || "Truck",
            assignedDriver: found.assignedDriver?._id || found.assignedDriver || "Unassigned",
            insuranceExpiry: found.insuranceExpiry ? found.insuranceExpiry.split('T')[0] : "",
            rcExpiry: found.rcExpiry ? found.rcExpiry.split('T')[0] : "",
            pollutionExpiry: found.pollutionExpiry ? found.pollutionExpiry.split('T')[0] : "",
            permitExpiry: found.permitExpiry ? found.permitExpiry.split('T')[0] : "",
            fitnessExpiry: found.fitnessExpiry ? found.fitnessExpiry.split('T')[0] : "",
            status: found.currentStatus || "Available",
            chassisNumber: found.chassisNumber || "",
            ownershipType: found.ownershipType || "Owned",
            ownership: found.ownership || found.ownershipType || "Owned",
            currentStatus: found.currentStatus || "Available",
            fuelCapacity: found.fuelCapacity || "",
            loadCapacity: found.loadCapacity || "",
            lastService: found.lastService ? found.lastService.split('T')[0] : "",
            nextService: found.nextService ? found.nextService.split('T')[0] : "",
            transmissionType: found.transmissionType || found.transmission || "Manual",
            registrationNumber: found.registrationNumber || found.vehicleNumber || "",
            branch: found.branch || found.branchDepot || "",
            registrationState: found.registrationState || "",
            registrationType: found.registrationType || "",
            fuelType: found.fuelType || "Diesel",
            seatingCapacity: found.seatingCapacity || "2",
            engineCC: found.engineCC || "",
            availability: found.availability || "Immediate",
            fastagBalance: found.fastagBalance || "",
          });

          // Prepopulate vehicle documents
          setVehicleDocs({
            rc: found.documents?.rc || null,
            insurance: found.documents?.insurance || null,
            puc: found.documents?.puc || null,
            fitness: found.documents?.fitness || null,
            permit: found.documents?.permit || null,
            roadTax: found.documents?.roadTax || null
          });
        } else {
          toast.error("Vehicle not found");
          navigate("/manager/vehicles-list");
        }
      } catch (err) {
        console.error("Failed to load vehicle:", err);
        toast.error("Failed to load vehicle from server.");
        navigate("/manager/vehicles-list");
      } finally {
        setLoading(false);
      }
    };
    loadVehicleAndDrivers();
  }, [id, navigate]);

  const handleSingleFileUpload = async (key, file) => {
    if (!file) return;

    setDocErrors(prev => ({ ...prev, [key]: "" }));

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      const errMsg = "Only PDF, JPG, PNG allowed.";
      setDocErrors(prev => ({ ...prev, [key]: errMsg }));
      toast.error(`Invalid format: ${file.name}. Only PDF, JPG, PNG allowed.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const errMsg = "Max 5MB allowed.";
      setDocErrors(prev => ({ ...prev, [key]: errMsg }));
      toast.error(`File too large: ${file.name}. Max 5MB allowed.`);
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [key]: true }));
    try {
      const response = await driverApi.uploadDocument(file);
      const data = response.data?.data || response.data;
      
      setVehicleDocs(prev => ({
        ...prev,
        [key]: {
          fileUrl: data.url,
          originalName: data.originalName,
          uploadDate: new Date(),
          fileSize: file.size,
          mimeType: file.type
        }
      }));
      toast.success(`${file.name} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Upload failed.";
      setDocErrors(prev => ({ ...prev, [key]: errMsg }));
      toast.error(errMsg);
    } finally {
      setUploadingDocs(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleRemoveFile = (key) => {
    setVehicleDocs(prev => ({
      ...prev,
      [key]: null
    }));
    setDocErrors(prev => ({ ...prev, [key]: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fastagBalance" ? Number(value) : value
    }));

    if (name === "chassisNumber") {
      const trimmed = value.trim();
      if (trimmed.length === 17) {
        setFormErrors(prev => ({ ...prev, chassisNumber: "" }));
      } else {
        setFormErrors(prev => ({ ...prev, chassisNumber: "Please enter exactly 17 characters." }));
      }
    } else {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Real-time duplicate check: debounced 600ms
    if (name in DUPLICATE_FIELDS) {
      setDuplicateErrors(prev => ({ ...prev, [name]: '' }));
      if (debounceTimers.current[name]) {
        clearTimeout(debounceTimers.current[name]);
      }
      if (!value || String(value).trim() === '') return;
      debounceTimers.current[name] = setTimeout(() => {
        checkFieldDuplicate(name, value);
      }, 600);
    }
  };

  const handleDuplicateBlur = (e) => {
    const { name, value } = e.target;
    if (!(name in DUPLICATE_FIELDS)) return;
    if (debounceTimers.current[name]) {
      clearTimeout(debounceTimers.current[name]);
      delete debounceTimers.current[name];
    }
    if (value && String(value).trim() !== '') {
      checkFieldDuplicate(name, value);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.plateNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    const trimmedChassis = (formData.chassisNumber || "").trim();
    if (trimmedChassis.length !== 17) {
      setFormErrors(prev => ({ ...prev, chassisNumber: "Please enter exactly 17 characters." }));
      toast.error("Please enter exactly 17 characters.");
      return;
    }



    try {
      setSaving(true);
      const payload = {
        vehicleName:        formData.name,
        brand:              formData.manufacturer || formData.brand,
        model:              formData.model,
        vehicleNumber:      formData.plateNumber.toUpperCase(),
        registrationNumber: formData.registrationNumber,
        vehicleType:        formData.type,
        branch:             formData.branch,
        fuelType:           formData.fuelType,
        fuelCapacity:       Number(formData.fuelCapacity) || 0,
        fastagBalance:      Number(formData.fastagBalance) || 0,
        odometer:           0,
        currentStatus:      formData.currentStatus || "Available",
        assignedDriver:     formData.assignedDriver === "Unassigned" ? "Unassigned" : formData.assignedDriver,
        chassisNumber:      formData.chassisNumber,
        loadCapacity:       Number(formData.loadCapacity) || 0,
        ownershipType:      formData.ownershipType || "Owned",
        insuranceExpiry:    formData.insuranceExpiry || undefined,
        permitExpiry:       formData.permitExpiry || undefined,
        engineCC:           formData.engineCC,
        transmissionType:   formData.transmissionType || "Manual",
        seatingCapacity:    formData.seatingCapacity || "2",
        registrationState:  formData.registrationState,
        registrationType:   formData.registrationType || "New",
        availability:       formData.availability || "Immediate",
        lastService:        formData.lastService || undefined,
        nextService:        formData.nextService || undefined,
        documents:          vehicleDocs,
      };
      await vehicleApi.update(id, payload);
      toast.success("Vehicle updated successfully!");
      navigate(`/manager/vehicle-details/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      toast.error(msg || "Failed to save vehicle details.");
      if (err.response?.status === 409) {
        if (msg.toLowerCase().includes("registration plate")) {
          setFormErrors(prev => ({ ...prev, plateNumber: msg }));
        } else if (msg.toLowerCase().includes("registration number")) {
          setFormErrors(prev => ({ ...prev, registrationNumber: msg }));
        } else if (msg.toLowerCase().includes("chassis number")) {
          setFormErrors(prev => ({ ...prev, chassisNumber: msg }));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 lg:p-8 bg-[#F5F7FB]">
        <p className="text-[#64748B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Edit Vehicle Details
          </h1>
        </div>
      </div>

      {/* Top Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Vehicle Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">VEHICLE</p>
          <div className="flex items-start gap-3">
            <div className="bg-[#FDF3EC] p-2 rounded flex-shrink-0">
              <FileText className="w-5 h-5 text-[#B45A0A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1E293B]">{formData.name}</p>
              <p className="text-xs text-[#64748B] mt-1 uppercase truncate">{formData.plateNumber || formData.vehicleNumber}</p>
            </div>
          </div>
        </div>

        {/* Insurance Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">Insurance Expiry</p>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-600">
                {formData.insuranceExpiry ? new Date(formData.insuranceExpiry).toLocaleDateString("en-IN") : "N/A"}
              </p>
              <p className="text-xs text-[#64748B] mt-1">✓ Valid and Active</p>
            </div>
          </div>
        </div>

        {/* FASTag Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">FASTag Balance</p>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded flex-shrink-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1E293B]">₹{formData.fastagBalance?.toLocaleString("en-IN") || "0"}</p>
              <p className="text-xs text-[#64748B] mt-1">Balance Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Plate Badge */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-[#FDF3EC] px-4 py-2 rounded-lg border-2 border-[#B45A0A]">
              <p className="text-lg font-bold text-[#B45A0A] uppercase">{formData.plateNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-bold uppercase">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  formData.status === "Available" ? "bg-green-100 text-green-700" :
                  formData.status === "On Trip" ? "bg-orange-100 text-orange-700" :
                  formData.status === "Maintenance" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => navigate(`/manager/vehicle-details/${vehicle._id}`)}
              className="px-4 py-2 border border-[#E7EAF0] rounded-lg text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={
                saving ||
                hasDuplicateErrors ||
                !formData.name ||
                !formData.plateNumber ||
                !vehicleDocs.rc ||
                !vehicleDocs.insurance ||
                !vehicleDocs.puc ||
                !vehicleDocs.fitness ||
                !vehicleDocs.permit ||
                !vehicleDocs.roadTax
              }
              className="px-6 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  SAVING
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SAVE CHANGES
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - General Information */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              General Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Vehicle Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Manufacturer / Brand</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer || ""}
                  onChange={handleChange}
                  placeholder="e.g. Ashok Leyland"
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Model Name</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model || ""}
                  onChange={handleChange}
                  placeholder="e.g. 3118"
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Vehicle Type</label>
                  <select
                    name="type"
                    value={formData.type || "Truck"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Lorry">Lorry</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="Tanker">Tanker</option>
                    <option value="Container">Container</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Chassis Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber || ""}
                    onChange={handleChange}
                    onBlur={handleDuplicateBlur}
                    placeholder="Enter Chassis Number"
                    maxLength={17}
                    className={`w-full px-3.5 py-2.5 border ${
                      formErrors.chassisNumber || duplicateErrors.chassisNumber
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[#E7EAF0] focus:border-[#B45A0A]'
                    } rounded-lg text-sm focus:outline-none bg-white text-[#1E293B]`}
                  />
                  {validatingFields.chassisNumber && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B45A0A] animate-spin" />
                  )}
                </div>
                {(formErrors.chassisNumber || duplicateErrors.chassisNumber) ? (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {formErrors.chassisNumber || duplicateErrors.chassisNumber}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">Enter exactly 17 characters.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Branch / Location</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability || "Immediate"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration & Legal */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Registration & Legal
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Plate No.</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="plateNumber"
                      value={formData.plateNumber || ""}
                      onChange={handleChange}
                      onBlur={handleDuplicateBlur}
                      required
                      className={`w-full px-3.5 py-2.5 border ${
                        formErrors.plateNumber || duplicateErrors.plateNumber
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#E7EAF0] focus:border-[#B45A0A]'
                      } rounded-lg text-sm focus:outline-none uppercase bg-white text-[#1E293B]`}
                    />
                    {validatingFields.plateNumber && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B45A0A] animate-spin" />
                    )}
                  </div>
                  {(formErrors.plateNumber || duplicateErrors.plateNumber) && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      {formErrors.plateNumber || duplicateErrors.plateNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Registration No.</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber || ""}
                      onChange={handleChange}
                      onBlur={handleDuplicateBlur}
                      className={`w-full px-3.5 py-2.5 border ${
                        formErrors.registrationNumber || duplicateErrors.registrationNumber
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#E7EAF0] focus:border-[#B45A0A]'
                      } rounded-lg text-sm focus:outline-none uppercase bg-white text-[#1E293B]`}
                    />
                    {validatingFields.registrationNumber && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B45A0A] animate-spin" />
                    )}
                  </div>
                  {(formErrors.registrationNumber || duplicateErrors.registrationNumber) && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      {formErrors.registrationNumber || duplicateErrors.registrationNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">State</label>
                  <select
                    name="registrationState"
                    value={formData.registrationState || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="">Select State</option>
                    <option value="MH">Maharashtra</option>
                    <option value="KA">Karnataka</option>
                    <option value="AP">Andhra Pradesh</option>
                    <option value="TN">Tamil Nadu</option>
                    <option value="DL">Delhi</option>
                    <option value="GJ">Gujarat</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Registration Type</label>
                  <select
                    name="registrationType"
                    value={formData.registrationType || "New"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="New">New</option>
                    <option value="RTO Transfer">RTO Transfer</option>
                    <option value="Re-registration">Re-registration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType || "Diesel"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="LPG">LPG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Transmission</label>
                  <select
                    name="transmissionType"
                    value={formData.transmissionType || "Manual"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Seat Cap.</label>
                  <select
                    name="seatingCapacity"
                    value={formData.seatingCapacity || "2"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Engine (CC)</label>
                  <input
                    type="text"
                    name="engineCC"
                    value={formData.engineCC || ""}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Status</label>
                  <select
                    name="currentStatus"
                    value={formData.currentStatus || "Available"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Ownership</label>
                  <select
                    name="ownershipType"
                    value={formData.ownershipType || "Owned"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                    <option value="Financed">Financed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Last Service Date</label>
                  <input
                    type="date"
                    name="lastService"
                    value={formData.lastService || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Next Service Due</label>
                  <input
                    type="date"
                    name="nextService"
                    value={formData.nextService || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Fuel Capacity (L)</label>
                  <input
                    type="number"
                    name="fuelCapacity"
                    value={formData.fuelCapacity || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Load Cap. (Tons)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="loadCapacity"
                    value={formData.loadCapacity || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">FASTag Bal. (₹)</label>
                  <input
                    type="number"
                    name="fastagBalance"
                    value={formData.fastagBalance || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* SECTION: Document Upload */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-6 mt-6">
        <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
          Document Upload
        </h3>
        <p className="text-xs text-[#64748B] mb-6">Manage all six required vehicle documents. All documents are mandatory.</p>

        {/* 6-Card Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(() => {
            const docLabels = {
              rc: "RC (Registration Certificate)",
              insurance: "Insurance Certificate",
              puc: "Pollution Under Control (PUC)",
              fitness: "Fitness Certificate",
              permit: "Permit Document",
              roadTax: "Road Tax Receipt"
            };

            return Object.keys(docLabels).map((key) => {
              const doc = vehicleDocs[key];
              const isUploading = uploadingDocs[key];
              const error = docErrors[key];
              const label = docLabels[key];

              return (
                <div key={key} className="bg-gray-50/50 border border-[#E7EAF0] rounded-2xl p-4 flex flex-col justify-between h-[135px] hover:border-[#B45A0A]/40 transition-colors">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#1E293B] font-poppins">{label}</span>
                              {doc && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 font-poppins bg-green-50 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Uploaded
                                </span>
                              )}
                            </div>

                            {error && (
                              <p className="text-[10px] text-red-600 font-medium font-poppins mt-1">
                                {error}
                              </p>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-center">
                            {isUploading ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <div className="w-5 h-5 border-2 border-[#B45A0A] border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-gray-500 font-medium">Uploading...</span>
                              </div>
                            ) : doc ? (
                              <div className="bg-white border border-[#E7EAF0] rounded-xl p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="w-4 h-4 text-[#B45A0A] shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{doc.originalName}</p>
                                    <p className="text-[9px] text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                    className="p-1 hover:bg-[#F5F7FB] rounded text-[11px] font-bold text-[#B45A0A] cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <label className="p-1 hover:bg-[#F5F7FB] rounded text-[11px] font-bold text-gray-600 cursor-pointer">
                                    Replace
                                    <input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleSingleFileUpload(key, e.target.files[0])}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(key)}
                                    className="p-1 hover:bg-red-50 rounded text-[11px] font-bold text-red-600 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="border border-dashed border-gray-300 hover:border-[#B45A0A] hover:bg-[#FDF3EC]/30 rounded-xl p-2 flex items-center justify-center gap-2 cursor-pointer transition-colors h-[50px]">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleSingleFileUpload(key, e.target.files[0])}
                                  className="hidden"
                                />
                                <Upload className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-[#1E293B]">Upload document (PDF, Image)</span>
                              </label>
                            )}
                          </div>
                        </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
