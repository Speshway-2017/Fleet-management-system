import { useState } from "react";
import { ArrowLeft, Upload, Check, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { identifyDocumentType } from "../utils/documentParser";
import { vehicleApi } from "@/api/vehicleApi";
import { managerApi } from "../api/managerApi";

export default function AddVehiclePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Basic Information
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    plateNumber: "",
    vehicleType: "Truck",
    branch: "",
    
    // Registration Details
    registrationNumber: "",
    registrationState: "",
    registrationType: "New",
    
    // Technical Specifications
    fuelType: "Diesel",
    transmissionType: "Manual",
    seatingCapacity: "2",
    engineCC: "",
    
    // Insurance & Compliance (extracted from documents)
    insuranceExpiry: "",
    lastService: "",
    nextService: "",
    ownership: "Owned",
    availability: "Immediate",
    fastagBalance: "",
    
    // Document Upload
    uploadedDocuments: []
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = [];
    let validFileCount = 0;

    for (let file of files) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid format: ${file.name}. Only PDF, JPG, PNG allowed.`);
        continue;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Max 5MB allowed.`);
        continue;
      }

      validFileCount++;
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          id: Math.random(),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2),
          data: e.target.result,
          originalFile: file
        };
        
        setUploadedFiles((prev) => {
          const updated = [...prev, newFile];
          if (updated.length === validFileCount + (uploadedFiles.length || 0)) {
            toast.success(`${file.name} uploaded successfully!`);
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
      newFiles.push(file);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    if (!formData.manufacturer || !formData.model || !formData.plateNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      // Map uploaded files to documents schema
      const documents = uploadedFiles.map(file => {
        const category = identifyDocumentType(file.name) || "Other";
        return {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          category: category,
          documentNumber: "",
          issueDate: new Date(),
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: "Manager",
          status: "Valid",
          fileData: file.data,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        };
      });

      // Map frontend field names to backend field names matching the new MongoDB Vehicle schema
      const payload = {
        vehicleName:        `${formData.manufacturer} ${formData.model}`,
        vehicleNumber:      formData.plateNumber.toUpperCase(),
        registrationNumber: formData.registrationNumber,
        vehicleType:        formData.vehicleType,
        brand:              formData.manufacturer,
        model:              formData.model,
        manufactureYear:    formData.year ? Number(formData.year) : undefined,
        currentStatus:      formData.availability === "Immediate" ? "Available" : "Inactive",
        fuelType:           formData.fuelType,
        fuelCapacity:       0,
        fastagBalance:      formData.fastagBalance ? Number(formData.fastagBalance) : 0,
        insuranceExpiry:    formData.insuranceExpiry || undefined,
        rcExpiry:           undefined,
        pollutionExpiry:    undefined,
        permitExpiry:       undefined,
        fitnessExpiry:      undefined,
        odometer:           0,
        documents:          documents,
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-xs text-[#64748B] mb-4">Upload insurance, RC, and other vehicle documents</p>

                {/* Upload Area */}
                <label className="block border-2 border-dashed border-[#B45A0A] rounded-xl p-8 cursor-pointer hover:bg-[#FDF3EC] transition-colors group bg-white mb-4">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center text-center gap-3">
                    <div className="bg-[#FDF3EC] p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-[#B45A0A]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">Upload Vehicle Documents</p>
                      <p className="text-xs text-[#64748B] mt-1">Click to browse or drag & drop files</p>
                      <p className="text-[10px] text-[#94A3B8] mt-2">PDF, JPG, PNG (Max 5MB each) - Insurance, RC, PUC, etc.</p>
                    </div>
                  </div>
                </label>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Uploaded Files ({uploadedFiles.length})</p>
                    </div>

                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl group hover:bg-gray-50">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-[#B45A0A] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#1E293B] truncate">{file.name}</p>
                              <p className="text-[10px] text-[#64748B]">{file.size} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="ml-2 p-1.5 hover:bg-[#E7EAF0] rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <X className="w-4 h-4 text-[#64748B]" />
                          </button>
                        </div>
                      ))}
                    </div>


                  </div>
                )}
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
                  disabled={isProcessing}
                  className="px-8 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
