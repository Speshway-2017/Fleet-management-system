import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Check, X, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { identifyDocumentType } from "../utils/documentParser";
import { vehicleApi } from "@/api/vehicleApi";
import { INDIAN_STATES } from "@/constants/indianStates";
import { vehicleSchema, validateForm } from "@/validations";
import { isSunday } from "@/validations/common.schema.js";
import CustomDatePicker from "@/components/common/CustomDatePicker";

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewOnly = user?.subscriptionStatus !== "ACTIVE";

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
  const [errors, setErrors] = useState({});

  const validateVehicleField = (name, value) => {
    let errorMsg = "";
    const strVal = String(value ?? "").trim();

    if (name === "manufacturer") {
      if (!strVal) {
        errorMsg = "Manufacturer is required.";
      } else if (/\d/.test(strVal)) {
        errorMsg = "Manufacturer must contain letters only (numbers are not allowed).";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) {
        errorMsg = "Manufacturer contains invalid characters.";
      } else if (/(.)\1{3,}/i.test(strVal)) {
        errorMsg = "Repeated characters are not allowed.";
      } else if (strVal.length < 2) {
        errorMsg = "Manufacturer must be at least 2 characters.";
      } else if (strVal.length > 50) {
        errorMsg = "Manufacturer must not exceed 50 characters.";
      }
    } else if (name === "model") {
      if (!strVal) {
        errorMsg = "Model is required.";
      } else if (!/^[a-zA-Z0-9\s.'-]+$/.test(strVal)) {
        errorMsg = "Model contains invalid characters.";
      } else if (!/[a-zA-Z0-9]/.test(strVal)) {
        errorMsg = "Model must contain alphanumeric characters.";
      } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z0-9]{2,4})\1{2,}/i.test(strVal.replace(/[\s.'-]+/g, ''))) {
        errorMsg = "Repeated characters are not allowed.";
      } else if (strVal.length < 2) {
        errorMsg = "Model must be at least 2 characters.";
      } else if (strVal.length > 50) {
        errorMsg = "Model must not exceed 50 characters.";
      }
    } else if (name === "registrationNumber" || name === "plateNumber") {
      if (!strVal) {
        errorMsg = "Registration Number is required.";
      } else if (!/^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/.test(strVal)) {
        errorMsg = "Registration Number must follow format: TS 76 HG 7576";
      }
    } else if (name === "chassisNumber") {
      if (strVal) {
        if (!/^[a-zA-Z0-9]+$/.test(strVal)) {
          errorMsg = "Chassis Number must contain alphanumeric characters only (letters and numbers).";
        } else if (/(.)\1{4,}/i.test(strVal)) {
          errorMsg = "Repeated characters are not allowed.";
        } else if (strVal.length !== 17) {
          errorMsg = "Chassis Number must be exactly 17 characters.";
        }
      }
    } else if (name === "year") {
      if (strVal) {
        const currentYear = new Date().getFullYear();
        const num = Number(strVal);
        if (isNaN(num) || !Number.isInteger(num)) {
          errorMsg = "Year must be a valid whole number.";
        } else if (num < 1990 || num > currentYear + 1) {
          errorMsg = `Year must be between 1990 and ${currentYear + 1}.`;
        }
      }
    } else if (name === "branch") {
      if (strVal) {
        if (/\d/.test(strVal)) {
          errorMsg = "Branch must contain letters only (numbers are not allowed).";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) {
          errorMsg = "Branch contains invalid characters.";
        } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z]{2,4})\1{2,}/i.test(strVal.replace(/[\s.'-]+/g, ''))) {
          errorMsg = "Repeated characters are not allowed.";
        } else if (strVal.length < 2) {
          errorMsg = "Branch must be at least 2 characters.";
        } else if (strVal.length > 50) {
          errorMsg = "Branch must not exceed 50 characters.";
        }
      }
    } else if (name === "registrationNumber") {
      if (strVal) {
        if (!/^[a-zA-Z0-9\s-]+$/.test(strVal)) {
          errorMsg = "Registration Number contains invalid characters.";
        } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z0-9]{2,4})\1{2,}/i.test(strVal.replace(/[\s-]+/g, ''))) {
          errorMsg = "Repeated characters are not allowed.";
        } else if (strVal.length < 4) {
          errorMsg = "Registration Number must be at least 4 characters.";
        } else if (strVal.length > 20) {
          errorMsg = "Registration Number must not exceed 20 characters.";
        } else if (!/[a-zA-Z]/.test(strVal)) {
          errorMsg = "Registration Number must contain letters (e.g. state code).";
        } else if (!/\d/.test(strVal)) {
          errorMsg = "Registration Number must contain numbers.";
        }
      }
    } else if (name === "engineCC") {
      if (strVal) {
        const num = Number(strVal);
        if (isNaN(num) || num < 50 || num > 25000) {
          errorMsg = "Engine CC must be a number between 50 and 25000.";
        }
      }
    } else if (name === "fuelCapacity") {
      if (strVal) {
        const num = Number(strVal);
        if (isNaN(num) || num <= 0 || num > 2000) {
          errorMsg = "Fuel Capacity must be between 1 and 2000 Litres.";
        }
      }
    } else if (name === "loadCapacity") {
      if (strVal) {
        const num = Number(strVal);
        if (isNaN(num) || num <= 0 || num > 100) {
          errorMsg = "Load Capacity must be between 0.1 and 100 Tons.";
        }
      }
    } else if (name === "fastagBalance") {
      if (strVal) {
        const num = Number(strVal);
        if (isNaN(num) || num < 0 || num > 500000) {
          errorMsg = "FASTag Balance must be between 0 and ₹5,00,000.";
        }
      }
    }
    return errorMsg;
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === "registrationNumber") {
      value = value.toUpperCase();
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "registrationNumber" ? { plateNumber: value } : {})
    }));
    const err = validateVehicleField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: err,
      ...(name === "registrationNumber" ? { plateNumber: err } : {})
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const err = validateVehicleField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: err,
      ...(name === "registrationNumber" ? { plateNumber: err } : {})
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

    if (file.size > 10 * 1024 * 1024) {
      const errMsg = "File size must be less than 10 MB.";
      setDocErrors(prev => ({ ...prev, [key]: errMsg }));
      toast.error(`File too large: ${file.name}. ${errMsg}`);
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [key]: true }));
    try {
      const response = await vehicleApi.uploadDocument(file);
      const data = response.data?.data || response.data;
      
      setVehicleDocs(prev => ({
        ...prev,
        [key]: {
          fileUrl: data.url || data.secure_url,
          public_id: data.public_id,
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

  const [vehicleImage, setVehicleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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
      toast.success("Vehicle image selected successfully.");
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
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    if (isViewOnly) {
      toast.error("Your subscription is inactive. Adding vehicles is disabled.");
      return;
    }

    const fieldList = ["manufacturer", "model", "registrationNumber", "year", "branch", "chassisNumber", "engineCC", "fuelCapacity", "loadCapacity", "fastagBalance"];
    const newErrors = {};
    let hasError = false;

    fieldList.forEach((field) => {
      const err = validateVehicleField(field, formData[field]);
      if (err) {
        newErrors[field] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError || "Please fix vehicle validation errors.");
      return;
    }

    const validationResult = validateForm(vehicleSchema, {
      ...formData,
      vehicleNumber: formData.registrationNumber,
      plateNumber: formData.registrationNumber,
      brand: formData.manufacturer
    });

    if (!validationResult.isValid) {
      const firstError = Object.values(validationResult.errors)[0];
      toast.error(firstError || "Please fix vehicle validation errors.");
      return;
    }

    setIsProcessing(true);
    try {
      // Map frontend field names to backend field names matching the new MongoDB Vehicle schema
      const payload = {
        vehicleName:        `${formData.manufacturer} ${formData.model}`,
        vehicleNumber:      formData.registrationNumber.toUpperCase(),
        registrationNumber: formData.registrationNumber.toUpperCase(),
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
        vehicleImage:       vehicleImage,
        imageName:          imageName
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
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-8 max-w-7xl">
            <form onSubmit={handleSaveVehicle} className="space-y-8">
              {/* SECTION 0: Vehicle Image Upload */}
              <div className="border-b border-[#E7EAF0] pb-6">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
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
                        <Check className="w-3.5 h-3.5" /> Ready for upload
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <label className="px-3 py-1.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
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
                      isDragOver ? "border-[#A14000] bg-[#A14000]/5 scale-[0.99]" : "border-[#E7EAF0] bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FDF3EC] border border-[#A14000]/20 text-[#A14000] flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#1E293B]">
                      Drag & Drop vehicle image here, or{" "}
                      <label className="text-[#A14000] underline cursor-pointer hover:text-[#853400]">
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
              {/* SECTION 1: Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#A14000] rounded flex items-center justify-center text-xs font-bold text-[#A14000]">1</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Basic Information</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Enter the basic details of your vehicle</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      placeholder="e.g. Ashok Leyland"
                      maxLength={50}
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.manufacturer ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.manufacturer && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.manufacturer}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      placeholder="e.g. 3118"
                      maxLength={50}
                      value={formData.model}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.model ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.model}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Year of Manufacture
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.year ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.year}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      placeholder="e.g. TS 76 HG 7576"
                      maxLength={13}
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none uppercase transition-colors bg-white ${
                        errors.registrationNumber ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.registrationNumber && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
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
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Branch / Location
                    </label>
                    <input
                      type="text"
                      name="branch"
                      placeholder="e.g. Pune"
                      maxLength={100}
                      value={formData.branch}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.branch ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.branch && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.branch}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Chassis Number
                    </label>
                    <input
                      type="text"
                      name="chassisNumber"
                      placeholder="e.g. 17-digit Chassis No."
                      value={formData.chassisNumber}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      maxLength={17}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.chassisNumber ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.chassisNumber && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.chassisNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Registration Details */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#A14000] rounded flex items-center justify-center text-xs font-bold text-[#A14000]">2</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Registration Details</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Provide registration certificate information</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      State
                    </label>
                    <select
                      name="registrationState"
                      value={
                        INDIAN_STATES.find(
                          (s) =>
                            s.code === formData.registrationState ||
                            s.name.toLowerCase() === (formData.registrationState || "").toLowerCase()
                        )?.code || formData.registrationState || ""
                      }
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
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
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Registration Type
                    </label>
                    <select
                      name="registrationType"
                      value={formData.registrationType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
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
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#A14000] rounded flex items-center justify-center text-xs font-bold text-[#A14000]">3</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Technical Specifications</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Vehicle technical details</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                      <option value="LPG">LPG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Transmission
                    </label>
                    <select
                      name="transmissionType"
                      value={formData.transmissionType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Seating Capacity
                    </label>
                    <select
                      name="seatingCapacity"
                      value={formData.seatingCapacity}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Engine (CC)
                    </label>
                    <input
                      type="text"
                      name="engineCC"
                      placeholder="e.g. 2500"
                      value={formData.engineCC}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.engineCC ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.engineCC && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.engineCC}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Fuel Capacity (L)
                    </label>
                    <input
                      type="number"
                      name="fuelCapacity"
                      placeholder="e.g. 200"
                      value={formData.fuelCapacity}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.fuelCapacity ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.fuelCapacity && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.fuelCapacity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      Load Cap. (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="loadCapacity"
                      placeholder="e.g. 15.5"
                      value={formData.loadCapacity}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.loadCapacity ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.loadCapacity && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.loadCapacity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2 font-poppins">
                      FASTag Balance (INR)
                    </label>
                    <input
                      type="number"
                      name="fastagBalance"
                      placeholder="e.g. 500"
                      value={formData.fastagBalance}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${
                        errors.fastagBalance ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                      }`}
                    />
                    {errors.fastagBalance && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.fastagBalance}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Compliance & Service Dates (Sundays in Red) */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#A14000] rounded flex items-center justify-center text-xs font-bold text-[#A14000]">4</div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Compliance & Service Dates</h2>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Set insurance, certificate, and maintenance service dates (Sunday dates are highlighted in red)</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Insurance Expiry */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        Insurance Expiry
                      </label>
                      {isSunday(formData.insuranceExpiry) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.insuranceExpiry)}
                      placeholder="Select Insurance Expiry"
                    />
                  </div>

                  {/* RC Expiry */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        RC Expiry
                      </label>
                      {isSunday(formData.rcExpiry) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="rcExpiry"
                      value={formData.rcExpiry}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.rcExpiry)}
                      placeholder="Select RC Expiry"
                    />
                  </div>

                  {/* PUC Expiry */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        PUC Expiry
                      </label>
                      {isSunday(formData.pollutionExpiry) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="pollutionExpiry"
                      value={formData.pollutionExpiry}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.pollutionExpiry)}
                      placeholder="Select PUC Expiry"
                    />
                  </div>

                  {/* Permit Expiry */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        Permit Expiry
                      </label>
                      {isSunday(formData.permitExpiry) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="permitExpiry"
                      value={formData.permitExpiry}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.permitExpiry)}
                      placeholder="Select Permit Expiry"
                    />
                  </div>

                  {/* Fitness Expiry */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        Fitness Expiry
                      </label>
                      {isSunday(formData.fitnessExpiry) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="fitnessExpiry"
                      value={formData.fitnessExpiry}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.fitnessExpiry)}
                      placeholder="Select Fitness Expiry"
                    />
                  </div>

                  {/* Last Service Date */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        Last Service Date
                      </label>
                      {isSunday(formData.lastService) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="lastService"
                      value={formData.lastService}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.lastService)}
                      placeholder="Select Last Service Date"
                    />
                  </div>

                  {/* Next Service Due */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                        Next Service Due
                      </label>
                      {isSunday(formData.nextService) && (
                        <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                      )}
                    </div>
                    <CustomDatePicker
                      name="nextService"
                      value={formData.nextService}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={Boolean(errors.nextService)}
                      placeholder="Select Next Service Due Date"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Document Upload */}
              <div className="border-t border-[#E7EAF0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#FDF3EC] border border-[#A14000] rounded flex items-center justify-center text-xs font-bold text-[#A14000]">5</div>
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
                        <div key={key} className="bg-gray-50/50 border border-[#E7EAF0] rounded-2xl p-4 flex flex-col justify-between h-[135px] hover:border-[#A14000]/40 transition-colors">
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
                                <div className="w-5 h-5 border-2 border-[#A14000] border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-gray-500 font-medium">Uploading...</span>
                              </div>
                            ) : doc ? (
                              <div className="bg-white border border-[#E7EAF0] rounded-xl p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="w-4 h-4 text-[#A14000] shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{doc.originalName}</p>
                                    <p className="text-[9px] text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                    className="p-1 hover:bg-[#F5F7FB] rounded text-[11px] font-bold text-[#A14000] cursor-pointer"
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
                              <label className="border border-dashed border-gray-300 hover:border-[#A14000] hover:bg-[#FDF3EC]/30 rounded-xl p-2 flex items-center justify-center gap-2 cursor-pointer transition-colors h-[50px]">
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
                  className={`px-8 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-[#A14000]/20 cursor-pointer disabled:opacity-50 flex items-center gap-2 ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
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
