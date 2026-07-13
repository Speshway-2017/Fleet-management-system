import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Edit2, Trash2, MapPin, AlertTriangle, Download, Eye, FileText, Phone, Mail, Eye as EyeIcon, X, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { vehicleApi } from "@/api/vehicleApi";
import { driverApi } from "@/api/driverApi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { managerApi } from "../api/managerApi";

export default function VehicleDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [vehicle, setVehicle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [driversList, setDriversList] = useState([]);

  // Location coordinates for different branches (mock data)
  const branchCoordinates = {
    "Pune": [18.5204, 73.8567],
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.7041, 77.1025],
    "Bangalore": [12.9716, 77.5946],
    "Hyderabad": [17.3850, 78.4867],
    "Chennai": [13.0827, 80.2707],
    "Kolkata": [22.5726, 88.3639],
    "Ahmedabad": [23.0225, 72.5714]
  };

  const normaliseVehicle = (v) => {
    if (!v) return null;
    return {
      ...v,
      id:           v._id,
      name:         v.vehicleName || `${v.brand} ${v.model}`,
      manufacturer: v.brand || "",
      plateNumber:  v.vehicleNumber || "",
      type:         v.vehicleType || "Truck",
      driver:       v.assignedDriver && typeof v.assignedDriver === 'object'
        ? v.assignedDriver.fullName
        : (typeof v.assignedDriver === 'string' ? v.assignedDriver : 'Unassigned'),
      fuelLevel:    v.fuelCapacity ? Math.round((v.odometer % v.fuelCapacity) || 50) : 50,
      fastagBalance: v.fastagBalance ?? 0,
      branch:       v.branch || "Pune",
      dateAdded:    v.createdAt ? v.createdAt.split('T')[0] : '',
      status:       v.currentStatus || 'Available',
    };
  };

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const res = await vehicleApi.getById(id);
        const found = res.data?.data;
        if (found) {
          setVehicle(normaliseVehicle(found));
        } else {
          toast.error("Vehicle not found");
          navigate("/manager/vehicles-list");
        }
      } catch (err) {
        console.error("Failed to load vehicle:", err);
        toast.error("Failed to load vehicle details from server.");
        navigate("/manager/vehicles-list");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id, navigate]);

  // Load drivers when assign modal opens
  useEffect(() => {
    if (showAssignModal) {
      const fetchDriversList = async () => {
        try {
          const res = await driverApi.list();
          setDriversList(res.data?.data ?? []);
        } catch (err) {
          console.error("Failed to load drivers:", err);
        }
      };
      fetchDriversList();
    }
  }, [showAssignModal]);

  // Initialize map
  useEffect(() => {
    if (!vehicle || !mapRef.current || mapInstanceRef.current) return;

    // Get branch coordinates or default to Pune
    const coordinates = branchCoordinates[vehicle.branch] || [18.5204, 73.8567];

    // Initialize Leaflet map
    const map = L.map(mapRef.current).setView(coordinates, 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Add marker for vehicle location
    const markerIcon = L.divIcon({
      html: `<div class="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-white shadow-lg animate-pulse" style="border: 2px solid white;">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
        </svg>
      </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker(coordinates, { icon: markerIcon })
      .bindPopup(`<div class="font-nunito"><strong>${vehicle.name}</strong><br/>Plate: ${vehicle.plateNumber}<br/>Status: ${vehicle.status}<br/>Branch: ${vehicle.branch}</div>`)
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [vehicle]);

  const handleDelete = async () => {
    try {
      setIsDeletingVehicle(true);
      const vehicleId = vehicle._id || vehicle.id;
      
      // Call API to delete the vehicle
      await vehicleApi.remove(vehicleId);
      
      toast.success("Vehicle deleted successfully!");
      navigate("/manager/vehicle-management");
    } catch (err) {
      // Handle different HTTP error responses
      if (!err.response) {
        toast.error("Unable to connect to the server. Please try again.");
      } else {
        const statusCode = err.response.status;
        const message = err.response?.data?.message;

        switch (statusCode) {
          case 400:
            toast.error(message || "Invalid request. Please check the vehicle details.");
            break;
          case 401:
            toast.error("You are not authenticated. Please log in again.");
            break;
          case 403:
            toast.error("You do not have permission to delete this vehicle.");
            break;
          case 404:
            toast.error("Vehicle not found. It may have been already deleted.");
            navigate("/manager/vehicle-management");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(message || "Failed to delete vehicle.");
        }
      }
    } finally {
      setIsDeletingVehicle(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAssignDriver = async (driverId) => {
    try {
      const vehicleId = vehicle._id || vehicle.id;
      const payload = {
        assignedDriver: driverId === "Unassigned" ? "Unassigned" : driverId
      };
      await vehicleApi.update(vehicleId, payload);
      toast.success("Driver assigned successfully!");

      // Refresh vehicle details
      const res = await vehicleApi.getById(id);
      setVehicle(normaliseVehicle(res.data?.data));
      setShowAssignModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign driver.");
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
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Vehicle Details
          </h1>
        </div>
      </div>

      {/* Top Vehicle Info Card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left side - Vehicle Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#FDF3EC] p-4 rounded-lg flex-shrink-0">
                <FileText className="w-8 h-8 text-[#B45A0A]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-[#1E293B]">{vehicle.name}</h2>
                  <span className="px-3 py-1 bg-orange-100 text-[#B45A0A] rounded-full text-xs font-bold">
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-sm text-[#64748B]">{vehicle.manufacturer}</p>
                <p className="text-lg font-bold text-[#1E293B] mt-2 uppercase">{vehicle.plateNumber || vehicle.vehicleNumber}</p>
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E7EAF0]">
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Registration</p>
                <p className="text-sm font-bold text-[#1E293B] mt-2">{vehicle.registrationNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Type</p>
                <p className="text-sm font-bold text-[#1E293B] mt-2">{vehicle.type}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Driver</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm font-bold text-[#1E293B]">{vehicle.driver}</p>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="text-xs text-[#B45A0A] hover:underline font-bold cursor-pointer"
                  >
                    {vehicle.driver === "Unassigned" ? "(Assign)" : "(Change)"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 md:ml-auto">
            <button
              onClick={() => navigate(`/manager/vehicle-edit/${vehicle._id}`)}
              className="px-6 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              EDIT
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 border border-red-300 hover:bg-red-50 rounded-lg text-sm font-bold text-red-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              General Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Vehicle Name</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Manufacturer</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.manufacturer}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Model</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.model || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Year</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.year || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Registration & Status */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Registration & Status
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Plate Number</p>
                <p className="text-sm font-semibold text-[#1E293B] uppercase">{vehicle.plateNumber}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Status</p>
                <span className={`px-2 py-1 rounded text-xs font-bold inline-block ${
                  vehicle.status === "Available" ? "bg-green-100 text-green-700" :
                  vehicle.status === "On Trip" ? "bg-orange-100 text-orange-700" :
                  vehicle.status === "Maintenance" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Fuel Type</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.fuelType}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Ownership</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.ownership}</p>
              </div>
            </div>
          </div>

          {/* Service & Insurance */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Service & Insurance
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Insurance Expiry</p>
                <p className="text-sm font-semibold text-[#1E293B]">
                  {new Date(vehicle.insuranceExpiry).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Last Service</p>
                <p className="text-sm font-semibold text-[#1E293B]">
                  {new Date(vehicle.lastService).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Next Service Due</p>
                <p className="text-sm font-semibold text-[#1E293B]">
                  {new Date(vehicle.nextService).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Availability</p>
                <p className="text-sm font-semibold text-[#1E293B]">{vehicle.availability}</p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Vehicle Documents
            </h3>
            {vehicle.documents && vehicle.documents.length > 0 ? (
              <div className="space-y-3">
                {vehicle.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-[#B45A0A] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#1E293B] truncate">{doc.name}</p>
                        <p className="text-[10px] text-[#64748B]">{doc.size} KB • {doc.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => setPreviewDocument(doc)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.data;
                          link.download = doc.name;
                          link.click();
                        }}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#F5F7FB] rounded-lg border border-dashed border-[#E7EAF0]">
                <FileText className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-[#64748B]">No documents uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary & Map */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-4">Vehicle Summary</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-[#64748B] font-medium">Registration No.</p>
                <p className="font-bold text-[#1E293B] mt-1 uppercase">{vehicle.plateNumber}</p>
              </div>
              <div className="border-t border-orange-200 pt-4">
                <p className="text-xs text-[#64748B] font-medium">FASTag Balance</p>
                <p className="font-bold text-[#1E293B] mt-1">₹{vehicle.fastagBalance?.toLocaleString("en-IN") || "0"}</p>
              </div>
              <div className="border-t border-orange-200 pt-4">
                <p className="text-xs text-[#64748B] font-medium">Branch</p>
                <p className="font-bold text-[#1E293B] mt-1">{vehicle.branch}</p>
              </div>
              <div className="border-t border-orange-200 pt-4">
                <p className="text-xs text-[#64748B] font-medium">Date Added</p>
                <p className="font-bold text-[#1E293B] mt-1">
                  {vehicle.dateAdded ? new Date(vehicle.dateAdded).toLocaleDateString("en-IN") : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0]">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2 uppercase">
                <MapPin className="w-4 h-4 text-[#B45A0A]" />
                Location
              </h3>
            </div>
            <div 
              ref={mapRef}
              className="w-full h-64 rounded-b-lg"
              style={{ zIndex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7EAF0] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E7EAF0] bg-[#F5F7FB]">
              <h3 className="text-lg font-bold text-[#1E293B] truncate">
                {previewDocument.name}
              </h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 hover:bg-[#E7EAF0] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewDocument.type === "application/pdf" ? (
                <div className="space-y-4">
                  <embed
                    src={previewDocument.data}
                    type="application/pdf"
                    className="w-full h-[500px] rounded-lg border border-[#E7EAF0]"
                  />
                  <p className="text-xs text-[#94A3B8] text-center">PDF Preview</p>
                </div>
              ) : previewDocument.type?.startsWith("image/") ? (
                <div className="space-y-4">
                  <img
                    src={previewDocument.data}
                    alt={previewDocument.name}
                    className="w-full rounded-lg border border-[#E7EAF0] object-contain max-h-[500px]"
                  />
                  <p className="text-xs text-[#94A3B8] text-center">Image Preview</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[#64748B] mb-2">Preview not available for this file type</p>
                  <p className="text-xs text-[#94A3B8] mb-6">{previewDocument.type}</p>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewDocument.data;
                      link.download = previewDocument.name;
                      link.click();
                    }}
                    className="px-4 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-bold text-white transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Document
                  </button>
                </div>
              )}

              {/* Document Info */}
              <div className="mt-6 p-4 bg-[#F5F7FB] rounded-lg border border-[#E7EAF0]">
                <h4 className="text-xs font-bold text-[#64748B] uppercase mb-3">Document Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[#64748B] font-medium">File Name</p>
                    <p className="text-[#1E293B] font-semibold mt-1 truncate">{previewDocument.name}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium">File Size</p>
                    <p className="text-[#1E293B] font-semibold mt-1">{previewDocument.size} KB</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium">Upload Date</p>
                    <p className="text-[#1E293B] font-semibold mt-1">{previewDocument.uploadDate}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium">File Type</p>
                    <p className="text-[#1E293B] font-semibold mt-1">{previewDocument.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E7EAF0] bg-[#F5F7FB]">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewDocument.data;
                  link.download = previewDocument.name;
                  link.click();
                }}
                className="px-6 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#B45A0A]/20"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setPreviewDocument(null)}
                className="px-6 py-2.5 border border-[#E7EAF0] rounded-lg text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && vehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">Confirm Deletion</h3>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
              <p className="text-sm text-red-800">
                Are you sure you want to delete <strong>{vehicle.name}</strong> ({vehicle.plateNumber})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingVehicle}
                className="px-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeletingVehicle}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingVehicle ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Vehicle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins text-[#1E293B]">Assign Driver</h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Select a driver from the active roster to assign to this vehicle ({vehicle.plateNumber}).
                </p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Unassign option */}
                <div 
                  onClick={() => handleAssignDriver("Unassigned")}
                  className="p-3 bg-red-50 hover:bg-red-100/70 border border-red-100 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-bold text-xs text-red-700">Leave Unassigned</p>
                    <span className="text-[10px] text-red-500 font-medium">Remove current driver from this vehicle</span>
                  </div>
                </div>

                 {driversList.map(d => (
                  <div 
                    key={d._id}
                    onClick={() => handleAssignDriver(d._id)}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      d.assignedVehicle === vehicle.plateNumber
                        ? "bg-indigo-50/50 border-indigo-200"
                        : "bg-white hover:bg-gray-50 border-[#E7EAF0]"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-[#1E293B]">{d.fullName}</p>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">DL: {d.licenseNumber} ({d.licenseType})</span>
                    </div>
                    {d.assignedVehicle && d.assignedVehicle !== "Unassigned" && d.assignedVehicle !== vehicle.plateNumber ? (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        {d.assignedVehicle}
                      </span>
                    ) : d.assignedVehicle === vehicle.plateNumber ? (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        Currently Assigned
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        Available
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
