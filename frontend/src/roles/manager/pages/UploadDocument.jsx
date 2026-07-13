import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  UploadCloud,
  Save,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { managerApi } from "../api/managerApi";

const DOC_TYPES = ["Insurance", "Vehicle Docs", "Driver Docs", "Trip Invoices", "Compliance"];

export default function UploadDocument() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    vehicle: "",
    expiry: ""
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await managerApi.getVehicles();
        const data = response.data?.data || response.data;
        if (Array.isArray(data)) {
          setVehiclesList(data);
        }
      } catch (err) {
        console.error("Failed to load vehicles list", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleSelectFileClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error("File size exceeds 25MB limit");
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const matchingVehicles = vehiclesList.filter(v => {
    const query = (formData.vehicle || "").toLowerCase();
    return (v.vehicleNumber || "").toLowerCase().includes(query) || (v.brand || "").toLowerCase().includes(query) || (v.model || "").toLowerCase().includes(query);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type) {
      toast.error("Please enter a document title and type");
      return;
    }
    try {
      await managerApi.createDocument({
        title: formData.title,
        type: formData.type,
        category: formData.type, // Map type to category
        vehicle: formData.vehicle || "All Vehicles",
        expiry: formData.expiry || "",
        fileUrl: "https://res.cloudinary.com/dummy-document-file.pdf", // Dummy URL
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "1.2 MB",
        fileType: selectedFile ? selectedFile.name.split('.').pop().toUpperCase() : "PDF",
        status: "Active"
      });
      toast.success("Document uploaded successfully!");
      navigate("/manager/documents");
    } catch (error) {
      toast.error("Failed to upload document");
      console.error(error);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Upload New Document
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
            Add legal, maintenance, or operational documents to your digital fleet library.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl w-fit">
          <Clock className="w-4 h-4 text-blue-700" />
          <span className="text-xs font-semibold text-blue-700">
            Draft Auto-saved
          </span>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Document Title
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Vehicle Insurance Certificate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Document Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors appearance-none"
              >
                <option value="">Select Type</option>
                {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Vehicle ID / Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Vehicle (e.g. FL-2024)"
                  value={formData.vehicle}
                  onFocus={() => setShowVehicleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowVehicleSuggestions(false), 200)}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#B45A0A] text-white p-1.5 rounded-lg">
                  <Search className="w-4 h-4" />
                </div>
                
                {showVehicleSuggestions && formData.vehicle.trim() !== "" && matchingVehicles.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {matchingVehicles.map((v) => (
                      <div
                        key={v._id}
                        onClick={() => {
                          setFormData({ ...formData, vehicle: `${v.vehicleNumber} [${v.brand} ${v.model || ""}]` });
                          setShowVehicleSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-xs font-nunito flex justify-between items-center"
                      >
                        <span className="font-bold text-gray-800 uppercase">{v.vehicleNumber}</span>
                        <span className="text-gray-500 text-[10px]">{v.brand} {v.model}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
              />
            </div>
          </div>

          {/* Drag & Drop Section */}
          <div className="mb-8">
            <label className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-4 block">
              Upload Files
            </label>
            <div 
              onClick={handleSelectFileClick}
              className="border-2 border-dashed border-[#E7EAF0] rounded-2xl p-16 text-center bg-[#F5F7FB]/50 hover:bg-[#F5F7FB] cursor-pointer transition-colors relative"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                className="hidden" 
              />
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-[#1E293B]">
                    File Selected Successfully
                  </h3>
                  <div className="bg-white border border-[#E7EAF0] rounded-xl p-3 max-w-sm mx-auto flex items-center justify-between gap-3 shadow-sm">
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs font-bold text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-orange-100 text-orange-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-[#1E293B]">
                    Drag & drop files here or click to browse
                  </h3>
                  <p className="text-sm text-[#64748B] mt-3">
                    Supported formats: PDF, JPG, PNG, DOCX (Max size: 25MB)
                  </p>
                  <button
                    type="button"
                    onClick={handleSelectFileClick}
                    className="mt-4 px-6 py-2 bg-[#1E293B] hover:bg-black rounded-xl text-white text-xs font-bold transition-colors"
                  >
                    Select File
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-[#64748B]">
              <Lock className="w-3.5 h-3.5" />
              All uploads are encrypted and secure.
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-6 border-t border-[#E7EAF0] flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/manager/documents")}
              className="px-8 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              Upload Document
            </button>
          </div>
        </form>
      </div>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <div className="text-[#B45A0A] mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-poppins font-semibold text-xl text-[#1E293B]">
            Smart Extraction
          </h3>
          <p className="text-sm text-[#64748B] mt-2">
            Our AI automatically reads expiry dates and policy numbers from your uploads.
          </p>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <div className="text-[#B45A0A] mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="font-poppins font-semibold text-xl text-[#1E293B]">
            Expiry Alerts
          </h3>
          <p className="text-sm text-[#64748B] mt-2">
            Get notified 30, 15, and 7 days before any document reaches its expiry date.
          </p>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <div className="text-[#B45A0A] mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-poppins font-semibold text-xl text-[#1E293B]">
            Compliance Ready
          </h3>
          <p className="text-sm text-[#64748B] mt-2">
            Documents uploaded here are instantly synced with the central compliance audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}
