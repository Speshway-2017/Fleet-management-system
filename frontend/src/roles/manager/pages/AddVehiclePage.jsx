import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Check, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { identifyDocumentType } from "../utils/documentParser";
import { vehicleApi } from "@/api/vehicleApi";
import { managerApi } from "../api/managerApi";
import { driverApi } from "@/api/driverApi";

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewOnly = user?.subscriptionStatus !== "ACTIVE";
  const [drivers, setDrivers] = useState([]);

  const [formData, setFormData] = useState({
    // Basic Information
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    plateNumber: "",
    vehicleType: "Truck",
    branch: "",
    chassisNumber: "",
    
    // Registration Details
    registrationNumber: "",
    registrationState: "",
    registrationType: "New",
    
    // Technical Specifications
    fuelType: "Diesel",
    transmissionType: "Manual",
    seatingCapacity: "2",
    engineCC: "",
    fuelCapacity: "",
    loadCapacity: "",
    
    // Insurance & Compliance (extracted from documents)
    insuranceExpiry: "",
    rcExpiry: "",
    pollutionExpiry: "",
    permitExpiry: "",
    fitnessExpiry: "",
    lastService: "",
    nextService: "",
    ownership: "Owned",
    availability: "Immediate",
    fastagBalance: "",
    assignedDriver: "Unassigned",
    
    // Document Upload
    uploadedDocuments: []
  });

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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const res = await driverApi.list();
        setDrivers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load drivers:", err);
      }
    };
    loadDrivers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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
      const errMsg = "Max size is 5MB.";
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

  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    if (!formData.manufacturer || !formData.model || !formData.plateNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      // Map frontend field names to backend field names matching the new MongoDB Vehicle schema
      const payload = {
        vehicleName:        `${formData.manufacturer} ${formData.model}`,
        vehicleNumber:      formData.plateNumber.toUpperCase(),
        registrationNumber: formData.registrationNumber,
        vehicleType:        formData.vehicleType || "Truck",
        brand:              formData.manufacturer,
        model:              formData.model,
        manufactureYear:    formData.year ? Number(formData.year) : undefined,
        currentStatus:      formData.availability === "Immediate" ? "Available" : "Inactive",
        fuelType:           formData.fuelType,
        fuelCapacity:       formData.fuelCapacity ? Number(formData.fuelCapacity) : 0,
        fastagBalance:      formData.fastagBalance ? Number(formData.fastagBalance) : 0,
        insuranceExpiry:    formData.insuranceExpiry || undefined,
        rcExpiry:           formData.rcExpiry || undefined,
        pollutionExpiry:    formData.pollutionExpiry || undefined,
        permitExpiry:       formData.permitExpiry || undefined,
        fitnessExpiry:      formData.fitnessExpiry || undefined,
        odometer:           0,
        documents:          vehicleDocs,
        chassisNumber:      formData.chassisNumber,
        engineCC:           formData.engineCC,
        lastService:        formData.lastService || undefined,
        nextService:        formData.nextService || undefined,
        transmissionType:   formData.transmissionType || "Manual",
        seatingCapacity:    formData.seatingCapacity || "2",
        registrationState:  formData.registrationState,
        registrationType:   formData.registrationType || "New",
        availability:       formData.availability || "Immediate",
        ownershipType:      formData.ownership || "Owned",
        branch:             formData.branch,
        loadCapacity:       formData.loadCapacity ? Number(formData.loadCapacity) : 0,
        assignedDriver:     formData.assignedDriver === "Unassigned" ? undefined : formData.assignedDriver,
      };

      await vehicleApi.create(payload);
      toast.success("Vehicle added successfully!");
      navigate("/manager/vehicle-management");
    } catch (err) {
      if (!err.response) {
        toast.error("Unable to connect to the server. Please try again.");
      } else {
        const msg = err.response?.data?.message;
        const status = err.response?.status;
        if (status === 409) {
          toast.error(msg || "A vehicle with this plate number already exists.");
        } else if (status === 400) {
          toast.error(msg || "Please fill in all required fields.");
        } else {
          toast.error(msg || "Failed to save vehicle. Please try again.");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Add Vehicle
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Register a new vehicle to your fleet management system
          </p>
        </div>
      </div>

          {/* Main Form Container */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-8 max-w-4xl">
            <form onSubmit={handleSaveVehicle} className="space-y-8">
              {/* SECTION 1: Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#B45A0A] rounded flex items-center justify-center text-xs font-bold text-[#B45A0A]">1</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Basic Information</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Enter the basic details of your vehicle</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Manufacturer *</label>
                    <input
                      type="text"
                      name="manufacturer"
                      placeholder="e.g. Ashok Leyland"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Model *</label>
                    <input
                      type="text"
                      name="model"
                      placeholder="e.g. 3118"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Year of Manufacture</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1990"
                      max={new Date().getFullYear()}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Registration Plate *</label>
                    <input
                      type="text"
                      name="plateNumber"
                      placeholder="e.g. MH 12 AB 5678"
                      value={formData.plateNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 uppercase bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    >
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Bus">Bus</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Tipper">Tipper</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Car">Car</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Branch / Location</label>
                    <input
                      type="text"
                      name="branch"
                      placeholder="e.g. Pune"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Chassis Number</label>
                    <input
                      type="text"
                      name="chassisNumber"
                      placeholder="e.g. 17-digit Chassis No."
                      value={formData.chassisNumber}
                      onChange={handleInputChange}
                      maxLength={17}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Registration Details */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#B45A0A] rounded flex items-center justify-center text-xs font-bold text-[#B45A0A]">2</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Registration Details</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Provide registration certificate information</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Registration No.</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      placeholder="e.g. MH-01-AB-2023"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 uppercase bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">State</label>
                    <select
                      name="registrationState"
                      value={formData.registrationState}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
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
                      value={formData.registrationType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    >
                      <option value="New">New</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Renewal">Renewal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Technical Specifications */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#B45A0A] rounded flex items-center justify-center text-xs font-bold text-[#B45A0A]">3</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Technical Specifications</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Vehicle technical details</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Fuel Type</label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
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
                      value={formData.transmissionType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Seating Capacity</label>
                    <select
                      name="seatingCapacity"
                      value={formData.seatingCapacity}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Engine (CC)</label>
                    <input
                      type="text"
                      name="engineCC"
                      placeholder="e.g. 2500"
                      value={formData.engineCC}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Fuel Capacity (L)</label>
                    <input
                      type="number"
                      name="fuelCapacity"
                      placeholder="e.g. 200"
                      value={formData.fuelCapacity}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Load Cap. (Tons)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="loadCapacity"
                      placeholder="e.g. 15.5"
                      value={formData.loadCapacity}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3B: Insurance & Compliance */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#B45A0A] rounded flex items-center justify-center text-xs font-bold text-[#B45A0A]">3B</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Insurance & Compliance</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Document-related information auto-filled from uploaded files</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Insurance Expiry Date</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry || ""}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Last Service Date</label>
                    <input
                      type="date"
                      name="lastService"
                      value={formData.lastService || ""}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Next Service Due</label>
                    <input
                      type="date"
                      name="nextService"
                      value={formData.nextService || ""}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Ownership</label>
                    <select
                      name="ownership"
                      value={formData.ownership || "Owned"}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    >
                      <option value="Owned">Owned</option>
                      <option value="Financed">Financed</option>
                      <option value="Leased">Leased</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Availability</label>
                    <select
                      name="availability"
                      value={formData.availability || "Immediate"}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">FASTag Balance (INR)</label>
                    <input
                      type="number"
                      name="fastagBalance"
                      placeholder="e.g. 500"
                      value={formData.fastagBalance}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A]/20 bg-white text-[#1E293B]"
                    />
                  </div>
                </div>


              </div>



              {/* SECTION 4: Document Upload */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#B45A0A] rounded flex items-center justify-center text-xs font-bold text-[#B45A0A]">4</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Document Upload</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-6">Manage all six required vehicle documents.</p>

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

              {/* Form Actions */}
              <div className="border-t border-[#E7EAF0] pt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/manager/vehicle-management")}
                  disabled={isProcessing}
                  className="px-6 py-2.5 border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || isViewOnly}
                  title={isViewOnly ? "This feature is available after activating a subscription." : "Save Vehicle"}
                  className={`px-8 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer disabled:opacity-50 flex items-center gap-2 ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Vehicle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
    </div>
  );
}
