import { useState } from "react";
import { ArrowLeft, Upload, Check, X, FileText, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { extractDataFromAllDocuments, identifyDocumentType } from "../utils/documentParser";

export default function AddVehiclePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Basic Information
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    plateNumber: "",
    
    // Registration Details
    registrationNumber: "",
    registrationState: "",
    registrationType: "New",
    
    // Technical Specifications
    fuelType: "Diesel",
    transmissionType: "Manual",
    seatingCapacity: "2",
    engineCC: "",
    
    // Document Upload
    uploadedDocuments: []
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState({});

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
          // Auto-extract data after all files are loaded
          if (updated.length === validFileCount + (uploadedFiles.length || 0)) {
            toast.success(`${file.name} uploaded successfully!`);
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
      newFiles.push(file);
    }

    if (validFileCount > 0) {
      toast.loading(`Preparing to extract data from ${validFileCount} document(s)...`, {
        id: 'file-loading'
      });
    }
  };

  const handleExtractData = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload documents first");
      return;
    }

    setIsExtracting(true);
    try {
      // Extract data from all uploaded documents
      const extracted = await extractDataFromAllDocuments(
        uploadedFiles.map(f => f.originalFile)
      );
      
      if (Object.keys(extracted).length > 0) {
        setExtractedData(extracted);
        
        // Auto-fill form with extracted data
        setFormData((prev) => {
          const updated = { ...prev };
          // Map extracted data to form fields
          Object.entries(extracted).forEach(([key, value]) => {
            if (key in updated && value) {
              updated[key] = value;
            }
          });
          return updated;
        });

        const extractedCount = Object.keys(extracted).length;
        toast.success(`✨ Extracted and auto-filled ${extractedCount} field${extractedCount > 1 ? 's' : ''}!`, {
          icon: '🚗',
          duration: 3000
        });
      } else {
        toast.error("Could not extract data from documents. Please fill manually.", {
          icon: '⚠️'
        });
      }
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error("Error extracting data. Please fill manually.", {
        icon: '❌'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();

    if (!formData.manufacturer || !formData.model || !formData.plateNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    
    // Simulate saving
    setTimeout(() => {
      const newVehicle = {
        id: Math.random(),
        name: `${formData.manufacturer} ${formData.model}`,
        manufacturer: formData.manufacturer,
        model: formData.model,
        year: formData.year,
        plateNumber: formData.plateNumber.toUpperCase(),
        registrationNumber: formData.registrationNumber,
        registrationState: formData.registrationState,
        fuelType: formData.fuelType,
        type: "Truck", // Default, can be mapped from vehicle type
        driver: "Unassigned",
        status: "Available",
        fastagBalance: 5000,
        insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastService: new Date().toISOString().split('T')[0],
        nextService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        branch: "Pune",
        ownership: "Owned",
        availability: "Immediate",
        dateAdded: new Date().toISOString().split('T')[0],
        documents: uploadedFiles.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          data: f.data,
          uploadDate: new Date().toISOString().split('T')[0]
        }))
      };

      // Save to localStorage
      const existingVehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
      localStorage.setItem("fleet_vehicles", JSON.stringify([...existingVehicles, newVehicle]));

      setIsProcessing(false);
      toast.success("Vehicle added successfully!");
      navigate("/manager/vehicle-management");
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/manager/vehicle-management")}
              className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[#64748B]" />
            </button>
            <div>
              <h1 className="text-3xl font-black font-poppins text-[#1E293B]">
                Add Vehicle
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
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
                      <button
                        type="button"
                        onClick={handleExtractData}
                        disabled={isExtracting || uploadedFiles.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B45A0A] to-[#9A4D08] hover:from-[#9A4D08] hover:to-[#7A3D06] rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExtracting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Extracting...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Extract Details</span>
                          </>
                        )}
                      </button>
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

                    {/* Extracted Data Preview */}
                    {Object.keys(extractedData).length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-[#FDF3EC] to-[#FEF5E7] border border-[#B45A0A]/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Check className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-bold text-[#B45A0A]">Auto-filled Details from Documents</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(extractedData).map(([key, value]) => {
                            // Convert camelCase to readable text
                            const label = key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())
                              .trim();
                            
                            return (
                              <div key={key} className="bg-white/60 p-2.5 rounded-lg backdrop-blur-sm">
                                <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">{label}</p>
                                <p className="text-xs font-bold text-[#1E293B] mt-1 line-clamp-2">{String(value)}</p>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-3 italic">
                          ℹ️ Review extracted values above. You can edit them before saving.
                        </p>
                      </div>
                    )}
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
