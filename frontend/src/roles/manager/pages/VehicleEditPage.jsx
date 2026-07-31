import { useState, useEffect } from "react";
import { ArrowLeft, Save, FileText, Calendar, Zap, Upload, Check, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { vehicleApi } from "@/api/vehicleApi";
import { INDIAN_STATES } from "@/constants/indianStates";

export default function VehicleEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isViewOnly = user?.subscriptionStatus !== "ACTIVE";
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({});
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

  const [vehicleImage, setVehicleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        const vehRes = await vehicleApi.getById(id);
        const found = vehRes.data?.data;
        if (found) {
          setVehicle(found);
          const currentImgUrl = found.vehicleImage?.secure_url || found.image || "";
          setImagePreview(currentImgUrl);
          setImageName(found.vehicleImage?.originalName || (currentImgUrl ? "vehicle_image.png" : ""));
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
    loadVehicle();
  }, [id, navigate]);

  const handleImageFile = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp"];

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      toast.error("Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeded. Maximum allowed image size is 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setVehicleImage(base64);
      setImagePreview(base64);
      setImageName(file.name);
      setRemoveImage(false);
      toast.success("New vehicle image selected.");
    };
    reader.onerror = () => {
      toast.error("Failed to upload image. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setVehicleImage(null);
    setImagePreview("");
    setImageName("");
    setRemoveImage(true);
    toast.success("Image removed.");
  };

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
      const response = await vehicleApi.uploadDocument(file);
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
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.plateNumber) {
      toast.error("Please fill in all required fields");
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
        vehicleImage:       vehicleImage || (removeImage ? null : (vehicle.vehicleImage || vehicle.image)),
        imageName:          imageName,
        removeImage:        removeImage
      };
      await vehicleApi.update(id, payload);
      toast.success("Vehicle updated successfully!");
      navigate(`/manager/vehicle-details/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save vehicle details.");
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
            <div className="bg-blue-50 p-2 rounded flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">{formData.insuranceExpiry || "N/A"}</p>
              <p className="text-xs text-[#64748B] mt-1">Policy Active</p>
            </div>
          </div>
        </div>

        {/* Fastag Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">FASTAG BALANCE</p>
          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 p-2 rounded flex-shrink-0">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">₹{Number(formData.fastagBalance || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Sufficient Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E7EAF0]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1E293B]">{formData.name}</h2>
              <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-bold text-[#64748B] uppercase">
                {formData.plateNumber || formData.vehicleNumber}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Registered under {formData.branch || "Pune"} Depot
            </p>
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
                isViewOnly ||
                !formData.name ||
                !formData.plateNumber
              }
              title={isViewOnly ? "This feature is available after activating a subscription." : "Save Changes"}
              className={`px-6 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
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
        {/* Vehicle Image Upload Section */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-3">
            Vehicle Image
          </label>

          {imagePreview ? (
            <div className="relative w-full max-w-md rounded-2xl border border-[#E7EAF0] p-4 bg-gray-50 flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Vehicle Preview"
                className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1E293B] truncate">{imageName || "Vehicle Image"}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Image attached
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <label className="px-3 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                    Replace Image
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={handleImageSelect} />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleImageDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all max-w-xl ${
                isDragOver ? "border-[#B45A0A] bg-[#B45A0A]/5 scale-[0.99]" : "border-[#E7EAF0] bg-gray-50/50 hover:bg-gray-50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#FDF3EC] border border-[#B45A0A]/20 text-[#B45A0A] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#1E293B]">
                Drag & Drop vehicle image here, or{" "}
                <label className="text-[#B45A0A] underline cursor-pointer hover:text-[#9A4D08]">
                  Browse
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={handleImageSelect} />
                </label>
              </p>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                Accepted formats: JPG, JPEG, PNG, WEBP (Max: 5 MB)
              </p>
            </div>
          )}
        </div>

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
                <input
                  type="text"
                  name="chassisNumber"
                  value={formData.chassisNumber || ""}
                  onChange={handleChange}
                  placeholder="Enter Chassis Number"
                  maxLength={17}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                />
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
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] uppercase bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Registration No.</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] uppercase bg-white text-[#1E293B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">State</label>
                  <select
                    name="registrationState"
                    value={
                      INDIAN_STATES.find(
                        (s) =>
                          s.code === formData.registrationState ||
                          s.name.toLowerCase() === (formData.registrationState || "").toLowerCase()
                      )?.code || formData.registrationState || ""
                    }
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name}
                      </option>
                    ))}
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
