import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  Award,
  Calendar,
  Save,
  FileUp,
  Loader,
  X,
  CheckCircle,
  FileText,
  Image,
  AlertCircle,
  Copy
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatDisplayLocation } from "@/utils/locationFormatter";
import { driverApi } from "@/api/driverApi";
import { driverSchema, validateForm } from "@/validations";
import { isSunday } from "@/validations/common.schema.js";
import CustomDatePicker from "@/components/common/CustomDatePicker";

// Format bytes to readable string
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (filename = "") => {
  const ext = String(filename).split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
    return <Image className="w-5 h-5 text-blue-500" />;
  }
  return <FileText className="w-5 h-5 text-[#A14000]" />;
};

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddDriverPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = "";
    const strVal = String(value || "").trim();

    if (name === "fullName") {
      if (!strVal) {
        errorMsg = "Full name is required.";
      } else if (strVal.length < 2) {
        errorMsg = "Full name must be at least 2 characters.";
      } else if (strVal.length > 50) {
        errorMsg = "Full name must not exceed 50 characters.";
      } else if (/\d/.test(strVal)) {
        errorMsg = "Full name must contain letters only (numbers are not allowed).";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) {
        errorMsg = "Full name contains invalid characters.";
      } else if (/(.)\1{3,}/i.test(strVal)) {
        errorMsg = "Repeated characters are not allowed.";
      }
    } else if (name === "phoneNumber" || name === "phone") {
      if (!strVal) {
        errorMsg = "Mobile number is required.";
      } else if (!/^\d+$/.test(strVal)) {
        errorMsg = "Mobile number must contain digits only.";
      } else if (!/^[1-9]/.test(strVal)) {
        errorMsg = "Mobile number must start with 1-9 (cannot start with 0).";
      } else if (strVal.length !== 10) {
        errorMsg = "Mobile number must contain exactly 10 digits.";
      }
    } else if (name === "email") {
      if (!strVal) {
        errorMsg = "Email address is required.";
      } else if (strVal.length > 80) {
        errorMsg = "Email must not exceed 80 characters.";
      } else if (/\s/.test(strVal)) {
        errorMsg = "Email address must not contain spaces.";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(strVal)) {
        errorMsg = "Please enter a valid email address.";
      }
    } else if (name === "licenseNumber") {
      if (!strVal) {
        errorMsg = "Driving License Number is required.";
      } else if (strVal.length !== 16) {
        errorMsg = "Driving License Number must be exactly 16 characters.";
      }
    } else if (name === "dob") {
      if (!strVal) {
        errorMsg = "Date of Birth is required.";
      } else {
        const d = new Date(strVal);
        const today = new Date();
        if (isNaN(d.getTime())) {
          errorMsg = "Please enter a valid date.";
        } else if (d > today) {
          errorMsg = "Date of birth cannot be in the future.";
        } else {
          const age = (today - d) / (1000 * 60 * 60 * 24 * 365.25);
          if (age < 18) {
            errorMsg = "Driver must be at least 18 years old.";
          }
        }
      }
    } else if (name === "licenseExpiry") {
      if (!strVal) {
        errorMsg = "License expiry date is required.";
      }
    } else if (name === "joiningDate") {
      if (!strVal) {
        errorMsg = "Joining date is required.";
      }
    } else if (name === "address") {
      if (!strVal) {
        errorMsg = "Address is required.";
      } else if (strVal.length < 5) {
        errorMsg = "Address must be at least 5 characters.";
      } else if (strVal.length > 200) {
        errorMsg = "Address must not exceed 200 characters.";
      } else if (/(.)\1{4,}/i.test(strVal) || /([a-zA-Z0-9]{2,5})\1{3,}/i.test(strVal.replace(/[\s,.'-]+/g, ''))) {
        errorMsg = "Repeated characters are not allowed.";
      }
    } else if (name === "driverLocation") {
      if (!strVal) {
        errorMsg = "Current Location is required.";
      } else if (strVal.length < 2) {
        errorMsg = "Location must be at least 2 characters.";
      } else if (strVal.length > 50) {
        errorMsg = "Location must not exceed 50 characters.";
      } else if (/\d/.test(strVal)) {
        errorMsg = "Location must contain letters only (numbers are not allowed).";
      } else if (!/^[a-zA-Z\s,.'-]+$/.test(strVal)) {
        errorMsg = "Location contains invalid characters.";
      } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z]{2,4})\1{2,}/i.test(strVal.replace(/[\s,.'-]+/g, ''))) {
        errorMsg = "Repeated characters are not allowed.";
      }
    } else if (name === "licenseIssuingAuthority") {
      if (strVal) {
        if (strVal.length < 2) {
          errorMsg = "Issuing Authority must be at least 2 characters.";
        } else if (strVal.length > 50) {
          errorMsg = "Issuing Authority must not exceed 50 characters.";
        } else if (/\d/.test(strVal)) {
          errorMsg = "Issuing Authority must contain letters only (numbers are not allowed).";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) {
          errorMsg = "Issuing Authority contains invalid characters.";
        } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z]{2,4})\1{2,}/i.test(strVal.replace(/[\s.'-]+/g, ''))) {
          errorMsg = "Repeated characters are not allowed.";
        }
      }
    } else if (name === "experience") {
      if (strVal && strVal.length > 30) {
        errorMsg = "Experience must not exceed 30 characters.";
      }
    }
    return errorMsg;
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleFieldBlur = (name, value) => {
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 10) val = val.slice(0, 10);
    handleFieldChange("phoneNumber", val);
  };

  const handleLicenseChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    handleFieldChange("licenseNumber", val);
  };

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    licenseNumber: "",
    licenseType: "HMV",
    licenseExpiry: "",
    driverStatus: "AVAILABLE",
    experience: "5 Years",
    joiningDate: new Date().toISOString().split("T")[0],
    medicalFitnessStatus: "✅ Fit",
    licenseDocument: "",
    employeeId: "",
    dob: "",
    gender: "Male",
    address: "",
    driverLocation: "",
    licenseIssuingAuthority: "",
  });

  // Upload state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState(null); // { url, originalName, size }

  // In edit mode — fetch driver from API
  useEffect(() => {
    if (!isEditMode) return;
    const fetchDriver = async () => {
      try {
        const res = await driverApi.getById(id);
        const d = res.data?.data;
        const isInactive = 
          ["INACTIVE", "IN-ACTIVE", "DELETED"].includes(String(d.driverStatus || "").toUpperCase().replace(/\s+/g, '')) ||
          ["INACTIVE", "IN-ACTIVE", "DELETED"].includes(String(d.accountStatus || "").toUpperCase().replace(/\s+/g, '')) ||
          ["INACTIVE", "IN-ACTIVE", "DELETED"].includes(String(d.status || "").toUpperCase().replace(/\s+/g, ''));

        if (isInactive) {
          toast.error("Cannot edit an in-active driver profile.");
          navigate(`/manager/driver-profile/${id}`);
          return;
        }

        const mapStatusToNew = (status) => {
          if (!status) return "✅ Fit";
          if (status.includes("Fit") && !status.includes("Unfit")) return "✅ Fit";
          if (status.includes("Review") || status.includes("Pending")) return "⚠️ Under Medical Review";
          if (status.includes("Unfit") || status.includes("Overdue")) return "❌ Unfit";
          return status;
        };

        setFormData({
          fullName: d.fullName || "",
          phoneNumber: d.phoneNumber || "",
          email: d.email || "",
          licenseNumber: d.licenseNumber || "",
          licenseType: d.licenseType || "HMV",
          licenseExpiry: d.licenseExpiry ? d.licenseExpiry.split("T")[0] : "",
          driverStatus: d.driverStatus || "AVAILABLE",
          experience: d.experience || "",
          joiningDate: d.joiningDate ? d.joiningDate.split("T")[0] : "",
          medicalFitnessStatus: mapStatusToNew(d.medicalFitnessStatus),
          licenseDocument: d.licenseDocument || "",
          employeeId: d.employeeId || "",
          dob: d.dob ? d.dob.split("T")[0] : "",
          gender: d.gender || "Male",
          address: d.address || "",
          driverLocation: formatDisplayLocation(d.driverLocation || d.currentLocation, d.branch),
          licenseIssuingAuthority: d.licenseIssuingAuthority || "",
        });
        const pErr = validateField("phoneNumber", d.phoneNumber || "");
        const lErr = validateField("licenseNumber", d.licenseNumber || "");
        setErrors({ phoneNumber: pErr, licenseNumber: lErr });

        if (d.licenseDocument) {
          // Show existing document in edit mode
          setUploadedDoc({
            url: d.licenseDocument,
            originalName: d.licenseDocument.split("/").pop(),
            size: null,
          });
        }
      } catch (err) {
        toast.error("Driver profile not found");
        navigate("/manager/drivers");
      }
    };
    fetchDriver();
  }, [id, isEditMode, navigate]);

  // ── File validation ──────────────────────────────────────────────────────
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed.");
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File must be smaller than 5MB.");
      return false;
    }
    return true;
  };

  // ── Upload to backend ────────────────────────────────────────────────────
  const uploadFile = async (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const res = await driverApi.uploadDocument(file, (loaded, total) => {
        setUploadProgress(Math.round((loaded / total) * 100));
      });
      const doc = res.data?.data;
      setUploadedDoc(doc);
      setFormData((prev) => ({ ...prev, licenseDocument: doc.url }));
      toast.success("Document uploaded successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed. Please try again.";
      toast.error(msg);
      setSelectedFile(null);
      setUploadedDoc(null);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Drag & Drop handlers ─────────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleRemoveDocument = () => {
    setSelectedFile(null);
    setUploadedDoc(null);
    setUploadProgress(0);
    setFormData((prev) => ({ ...prev, licenseDocument: null }));
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrs = {
      fullName: validateField("fullName", formData.fullName),
      phoneNumber: validateField("phoneNumber", formData.phoneNumber),
      email: validateField("email", formData.email),
      licenseNumber: validateField("licenseNumber", formData.licenseNumber),
      dob: validateField("dob", formData.dob),
      licenseExpiry: validateField("licenseExpiry", formData.licenseExpiry),
      joiningDate: validateField("joiningDate", formData.joiningDate),
      address: validateField("address", formData.address),
      driverLocation: validateField("driverLocation", formData.driverLocation),
      licenseIssuingAuthority: validateField("licenseIssuingAuthority", formData.licenseIssuingAuthority),
      experience: validateField("experience", formData.experience)
    };
    setErrors(allErrs);
    const firstError = Object.values(allErrs).find(Boolean);
    if (firstError) {
      toast.error(firstError);
      return;
    }

    if (
      !formData.dob ||
      !formData.gender ||
      !formData.address ||
      !formData.driverLocation
    ) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await driverApi.update(id, formData);
        toast.success("Driver profile updated successfully!");
        navigate("/manager/drivers");
      } else {
        const res = await driverApi.create(formData);
        const empId = res.data?.employeeId || res.data?.data?.employeeId;
        const tempPwd = res.data?.temporaryPassword || res.data?.data?.temporaryPassword;
        
        if (empId && tempPwd) {
          setCreatedCredentials({
            employeeId: empId,
            temporaryPassword: tempPwd
          });
          toast.success("Driver created successfully!");
        } else {
          toast.success("New driver registered successfully!");
          navigate("/manager/drivers");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg || "Failed to save driver. Please check duplicate entries.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid =
    !formData.fullName ||
    !formData.phoneNumber ||
    !formData.email ||
    !formData.licenseNumber ||
    !formData.dob ||
    !formData.licenseExpiry ||
    !formData.address ||
    !formData.driverLocation ||
    Object.values(errors).some(Boolean);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <Breadcrumb />

      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            {isEditMode ? "Edit Driver Profile" : "Register New Driver"}
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            {isEditMode
              ? "Modify parameters for this driver roster item."
              : "Create a new compliant operator identity record."}
          </p>
        </div>
      </div>

      {/* --- FORM CONTAINER --- */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">

        {/* CARD 1: Personal Details */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
          <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-[#A14000]" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee ID */}
            {isEditMode && (
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Employee ID</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Auto-generated on save"
                  value={formData.employeeId}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Full Name *</label>
              <input
                type="text"
                maxLength={50}
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.fullName
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Contact Phone *</label>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="e.g. 9998887776"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                onBlur={(e) => handleFieldBlur("phoneNumber", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.phoneNumber
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Email Address *</label>
              <input
                type="email"
                maxLength={50}
                required
                placeholder="e.g. ramesh.c@fleet.com"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.email
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Date of Birth *
                </label>
                {isSunday(formData.dob) && (
                  <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                )}
              </div>
              <CustomDatePicker
                name="dob"
                required
                value={formData.dob}
                onChange={(e) => handleFieldChange("dob", e.target.value)}
                onBlur={(e) => handleFieldBlur("dob", e.target.value)}
                error={Boolean(errors.dob)}
                placeholder="Select Date of Birth"
              />
              {errors.dob && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.dob}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => handleFieldChange("gender", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Selection - Only in Edit Mode */}
            {isEditMode && (
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Current Status</label>
                <select
                  value={formData.driverStatus}
                  onChange={(e) => handleFieldChange("driverStatus", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            )}

            {/* Current Location */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Current Location (City/Branch) *</label>
              <input
                type="text"
                maxLength={100}
                required
                placeholder="e.g. Pune, Hyderabad, Delhi"
                value={formData.driverLocation}
                onChange={(e) => handleFieldChange("driverLocation", e.target.value)}
                onBlur={(e) => handleFieldBlur("driverLocation", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.driverLocation
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.driverLocation && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.driverLocation}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Address *</label>
              <textarea
                required
                maxLength={300}
                rows={3}
                placeholder="e.g. Flat 101, Green Meadows, Pune, MH"
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                onBlur={(e) => handleFieldBlur("address", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] font-sans resize-none ${
                  errors.address
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.address && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: License Details */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
          <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-[#A14000]" />
            Driving License &amp; Compliance Certificates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DL Number */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">License Number *</label>
              <input
                type="text"
                maxLength={16}
                required
                placeholder="e.g. DL18202200112234"
                value={formData.licenseNumber}
                onChange={handleLicenseChange}
                onBlur={(e) => handleFieldBlur("licenseNumber", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.licenseNumber
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.licenseNumber && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.licenseNumber}
                </p>
              )}
            </div>

            {/* License Class/Type */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">License Class</label>
              <select
                value={formData.licenseType}
                onChange={(e) => handleFieldChange("licenseType", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
              >
                <option value="HMV">HMV</option>
                <option value="LMV">LMV</option>
                <option value="MCWG">MCWG</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Expiry Date *
                </label>
                {isSunday(formData.licenseExpiry) && (
                  <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                )}
              </div>
              <CustomDatePicker
                name="licenseExpiry"
                required
                value={formData.licenseExpiry}
                onChange={(e) => handleFieldChange("licenseExpiry", e.target.value)}
                onBlur={(e) => handleFieldBlur("licenseExpiry", e.target.value)}
                error={Boolean(errors.licenseExpiry)}
                placeholder="Select License Expiry Date"
              />
              {errors.licenseExpiry && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.licenseExpiry}
                </p>
              )}
            </div>

            {/* Issuing Authority */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Issuing Authority</label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. RTO Pune"
                value={formData.licenseIssuingAuthority}
                onChange={(e) => handleFieldChange("licenseIssuingAuthority", e.target.value)}
                onBlur={(e) => handleFieldBlur("licenseIssuingAuthority", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.licenseIssuingAuthority
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.licenseIssuingAuthority && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.licenseIssuingAuthority}
                </p>
              )}
            </div>
          </div>

          {/* ── DOCUMENT UPLOAD AREA ─────────────────────────────────────── */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Driving License Scan (PDF / JPG / PNG)
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Uploaded state */}
            {uploadedDoc ? (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                  {getFileIcon(uploadedDoc.originalName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1E293B] truncate">{uploadedDoc.originalName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Uploaded successfully{uploadedDoc.size ? ` · ${formatBytes(uploadedDoc.size)}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* View link */}
                  <a
                    href={uploadedDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#A14000] font-bold hover:underline"
                  >
                    View
                  </a>
                  {/* Replace */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#64748B] font-bold hover:text-[#1E293B] transition-colors"
                  >
                    Replace
                  </button>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : isUploading ? (
              /* Uploading state */
              <div className="border-2 border-dashed border-[#A14000]/40 bg-[#FDF3EC]/30 rounded-xl p-6">
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-[#A14000] animate-spin" />
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs font-semibold text-[#64748B] mb-1.5">
                      <span>Uploading {selectedFile?.name}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E7EAF0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#A14000] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle / drag-over state */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 select-none ${
                  isDragging
                    ? "border-[#A14000] bg-[#FDF3EC]/60 scale-[1.01]"
                    : "border-[#E7EAF0] hover:border-[#A14000] hover:bg-[#FDF3EC]/20"
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
                  isDragging ? "bg-[#A14000]/10" : "bg-[#F5F7FB]"
                }`}>
                  <FileUp className={`w-6 h-6 transition-colors ${isDragging ? "text-[#A14000]" : "text-[#64748B]"}`} />
                </div>
                <p className={`text-sm font-bold transition-colors ${isDragging ? "text-[#A14000]" : "text-[#1E293B]"}`}>
                  {isDragging ? "Drop file here to upload" : "Drag & drop or click to upload"}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">PDF, JPG, PNG · Max 5 MB</p>
              </div>
            )}

            {/* Validation hint */}
            {!uploadedDoc && !isUploading && (
              <p className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] font-medium mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Upload a scan of the physical driving license for compliance records.
              </p>
            )}
          </div>
        </div>

        {/* CARD 3: Employment Info */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
          <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#A14000]" />
            Professional &amp; Roster Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Years Experience */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Years of Experience</label>
              <input
                type="text"
                maxLength={30}
                placeholder="e.g. 5 Years"
                value={formData.experience}
                onChange={(e) => handleFieldChange("experience", e.target.value)}
                onBlur={(e) => handleFieldBlur("experience", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none bg-white text-[#1E293B] ${
                  errors.experience
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {errors.experience && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.experience}
                </p>
              )}
            </div>

            {/* Joining Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Joining Date
                </label>
                {isSunday(formData.joiningDate) && (
                  <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                )}
              </div>
              <CustomDatePicker
                name="joiningDate"
                value={formData.joiningDate}
                onChange={(e) => handleFieldChange("joiningDate", e.target.value)}
                onBlur={(e) => handleFieldBlur("joiningDate", e.target.value)}
                error={Boolean(errors.joiningDate)}
                placeholder="Select Joining Date"
              />
              {errors.joiningDate && (
                <p className="text-xs text-[#EF4444] mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.joiningDate}
                </p>
              )}
            </div>

            {/* Medical Fitness */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Medical Fitness Status</label>
              <select
                value={formData.medicalFitnessStatus}
                onChange={(e) => handleFieldChange("medicalFitnessStatus", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
              >
                <option value="✅ Fit">✅ Fit</option>
                <option value="⚠️ Under Medical Review">⚠️ Under Medical Review</option>
                <option value="❌ Unfit">❌ Unfit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/manager/driver-profile/${id}` : "/manager/drivers")}
            disabled={isSubmitting || isUploading}
            className="px-6 py-3 border border-[#E7EAF0] hover:bg-gray-100 rounded-xl text-sm font-bold text-[#64748B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading || isFormInvalid}
            className="px-7 py-3 bg-[#A14000] hover:bg-[#853400] rounded-xl text-sm font-extrabold text-white transition-all shadow-md shadow-[#A14000]/20 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4.5 h-4.5 animate-spin" />
                <span>{isEditMode ? "Saving..." : "Registering..."}</span>
              </>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                <span>{isEditMode ? "Save Changes" : "Register Driver"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* --- DRIVER CREATED SUCCESSFUL CREDENTIALS MODAL --- */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-[#E7EAF0]">
            <div className="flex items-start justify-between border-b border-[#E7EAF0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm border border-emerald-100 text-lg">
                  🎉
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-[#1E293B]">Driver Created Successfully</h3>
                  <p className="text-xs text-[#64748B] font-medium">New operator identity registered</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-3 font-poppins">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">Employee ID</span>
                <span className="text-xl font-black text-[#1E293B] block mt-0.5 tracking-wide">{createdCredentials.employeeId}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">Temporary Password</span>
                <span className="text-lg font-mono font-bold text-[#A14000] block mt-0.5 tracking-wider">{createdCredentials.temporaryPassword}</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium space-y-1">
              <p className="text-xs text-amber-800 leading-relaxed font-sans font-semibold">
                Please copy these credentials and share them securely with the Driver.
              </p>
              <p className="text-[11px] text-amber-700 leading-relaxed font-sans italic">
                These credentials will only be shown once.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const copyText = `Employee ID:\n${createdCredentials.employeeId}\n\nTemporary Password:\n${createdCredentials.temporaryPassword}`;
                  navigator.clipboard.writeText(copyText);
                  toast.success("Credentials copied successfully.");
                }}
                className="flex-1 py-3 bg-[#A14000] hover:bg-[#853400] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#A14000]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedCredentials(null);
                  navigate("/manager/drivers");
                }}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-[#64748B] hover:text-[#1E293B] rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
