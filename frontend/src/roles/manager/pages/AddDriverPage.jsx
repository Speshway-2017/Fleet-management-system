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
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { driverApi } from "@/api/driverApi";

// Format bytes to readable string
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddDriverPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    medicalFitnessStatus: "Fit",
    licenseDocument: "",
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
        if (!d) throw new Error("Not found");
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
          medicalFitnessStatus: d.medicalFitnessStatus || "Fit",
          licenseDocument: d.licenseDocument || "",
        });
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
    setFormData((prev) => ({ ...prev, licenseDocument: "" }));
  };

  // ── Get file icon based on type ──────────────────────────────────────────
  const getFileIcon = (name = "") => {
    const ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
    return <Image className="w-5 h-5 text-blue-500" />;
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.licenseNumber) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await driverApi.update(id, formData);
        toast.success("Driver profile updated successfully!");
      } else {
        await driverApi.create(formData);
        toast.success("New driver registered successfully!");
      }
      navigate("/manager/drivers");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        toast.error(msg || "A driver with this license number or email already exists.");
      } else if (status === 400) {
        toast.error(msg || "Please fill in all required fields.");
      } else {
        toast.error(msg || "Failed to save driver. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

        {/* CARD 1: Personal Details */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
          <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-[#B45A0A]" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 99988 87776"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. ramesh.c@fleet.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* Status Selection */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Current Status</label>
              <select
                value={formData.driverStatus}
                onChange={(e) => setFormData({ ...formData, driverStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: License Details */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
          <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-[#B45A0A]" />
            Driving License &amp; Compliance Certificates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* DL Number */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">License Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. DL-1820220011223"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* License Class/Type */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">License Class</label>
              <select
                value={formData.licenseType}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              >
                <option value="HMV">HMV</option>
                <option value="LMV">LMV</option>
                <option value="MCWG">MCWG</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
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
                    className="text-[11px] text-[#B45A0A] font-bold hover:underline"
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
              <div className="border-2 border-dashed border-[#B45A0A]/40 bg-[#FDF3EC]/30 rounded-xl p-6">
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-[#B45A0A] animate-spin" />
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs font-semibold text-[#64748B] mb-1.5">
                      <span>Uploading {selectedFile?.name}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E7EAF0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#B45A0A] h-1.5 rounded-full transition-all duration-300"
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
                    ? "border-[#B45A0A] bg-[#FDF3EC]/60 scale-[1.01]"
                    : "border-[#E7EAF0] hover:border-[#B45A0A] hover:bg-[#FDF3EC]/20"
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
                  isDragging ? "bg-[#B45A0A]/10" : "bg-[#F5F7FB]"
                }`}>
                  <FileUp className={`w-6 h-6 transition-colors ${isDragging ? "text-[#B45A0A]" : "text-[#64748B]"}`} />
                </div>
                <p className={`text-sm font-bold transition-colors ${isDragging ? "text-[#B45A0A]" : "text-[#1E293B]"}`}>
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
            <Calendar className="w-5 h-5 text-[#B45A0A]" />
            Professional &amp; Roster Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Years Experience */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Driving Experience</label>
              <input
                type="text"
                placeholder="e.g. 5 Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* Medical Fitness */}
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Medical Fitness Status</label>
              <select
                value={formData.medicalFitnessStatus}
                onChange={(e) => setFormData({ ...formData, medicalFitnessStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              >
                <option value="Fit">Fit</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
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
            disabled={isSubmitting || isUploading}
            className="px-7 py-3 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-extrabold text-white transition-all shadow-md shadow-[#B45A0A]/20 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
    </div>
  );
}
