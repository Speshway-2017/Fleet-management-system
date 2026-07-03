import axios from "axios";

// Create Axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Add Authorization interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get all documents for a specific vehicle
 * @param {string|number} vehicleId - Vehicle ID
 * @returns {Promise} Array of documents
 */
export const getVehicleDocuments = async (vehicleId) => {
  try {
    // For now, use mock data from localStorage
    const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.documents || [];
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

/**
 * Upload a new document for a vehicle
 * @param {string|number} vehicleId - Vehicle ID
 * @param {FormData} formData - Form data containing document details and file
 * @returns {Promise} Uploaded document data
 */
export const uploadVehicleDocument = async (vehicleId, formData) => {
  try {
    // For now, store in localStorage
    const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) throw new Error("Vehicle not found");

    const newDocument = {
      id: Math.random(),
      name: formData.get("documentName"),
      category: formData.get("category"),
      documentNumber: formData.get("documentNumber") || "",
      issueDate: formData.get("issueDate"),
      expiryDate: formData.get("expiryDate"),
      notes: formData.get("notes") || "",
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: "Current User",
      status: "Valid",
      fileData: formData.get("file").data,
      fileName: formData.get("file").name,
      fileSize: formData.get("file").size,
      fileType: formData.get("file").type
    };

    if (!vehicles[vehicleIndex].documents) {
      vehicles[vehicleIndex].documents = [];
    }
    
    vehicles[vehicleIndex].documents.push(newDocument);
    localStorage.setItem("fleet_vehicles", JSON.stringify(vehicles));
    
    return newDocument;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

/**
 * Replace an existing document
 * @param {string|number} vehicleId - Vehicle ID
 * @param {string|number} documentId - Document ID to replace
 * @param {FormData} formData - New document data
 * @returns {Promise} Updated document
 */
export const replaceVehicleDocument = async (vehicleId, documentId, formData) => {
  try {
    const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) throw new Error("Vehicle not found");

    const docIndex = vehicles[vehicleIndex].documents.findIndex(d => d.id === documentId);
    if (docIndex === -1) throw new Error("Document not found");

    const updatedDocument = {
      ...vehicles[vehicleIndex].documents[docIndex],
      name: formData.get("documentName"),
      category: formData.get("category"),
      documentNumber: formData.get("documentNumber") || "",
      issueDate: formData.get("issueDate"),
      expiryDate: formData.get("expiryDate"),
      notes: formData.get("notes") || "",
      fileData: formData.get("file").data,
      fileName: formData.get("file").name,
      fileSize: formData.get("file").size,
      fileType: formData.get("file").type,
      replacedDate: new Date().toISOString().split('T')[0]
    };

    vehicles[vehicleIndex].documents[docIndex] = updatedDocument;
    localStorage.setItem("fleet_vehicles", JSON.stringify(vehicles));
    
    return updatedDocument;
  } catch (error) {
    console.error("Error replacing document:", error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string|number} vehicleId - Vehicle ID
 * @param {string|number} documentId - Document ID to delete
 * @returns {Promise} Success response
 */
export const deleteVehicleDocument = async (vehicleId, documentId) => {
  try {
    const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) throw new Error("Vehicle not found");

    vehicles[vehicleIndex].documents = vehicles[vehicleIndex].documents.filter(
      d => d.id !== documentId
    );
    
    localStorage.setItem("fleet_vehicles", JSON.stringify(vehicles));
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

/**
 * Download a document
 * @param {Object} document - Document object containing file data
 * @returns {void}
 */
export const downloadVehicleDocument = (document) => {
  try {
    const link = document.createElement("a");
    link.href = document.fileData;
    link.download = document.fileName;
    link.click();
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
};

/**
 * Get a specific document by ID
 * @param {string|number} vehicleId - Vehicle ID
 * @param {string|number} documentId - Document ID
 * @returns {Promise} Document data
 */
export const getDocumentById = async (vehicleId, documentId) => {
  try {
    const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const document = vehicle?.documents?.find(d => d.id === documentId);
    
    if (!document) throw new Error("Document not found");
    return document;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

/**
 * Determine document status based on expiry date
 * @param {string} expiryDate - Document expiry date
 * @returns {string} Status: "Valid", "Expiring Soon", "Expired"
 */
export const getDocumentStatus = (expiryDate) => {
  if (!expiryDate) return "Valid";
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return "Expired";
  if (daysUntilExpiry <= 30) return "Expiring Soon";
  return "Valid";
};

/**
 * Get status badge color
 * @param {string} status - Document status
 * @returns {string} Tailwind CSS class
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Valid":
      return "bg-green-100 text-green-700";
    case "Expiring Soon":
      return "bg-orange-100 text-orange-700";
    case "Expired":
      return "bg-red-100 text-red-700";
    case "Pending Verification":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default API;
