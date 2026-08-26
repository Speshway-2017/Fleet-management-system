import { vehicleApi } from "@/api/vehicleApi";

const resolveDocumentUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

/**
 * Get all documents for a specific vehicle
 * @param {string} vehicleId - Vehicle MongoDB ID
 * @returns {Promise} Array of documents
 */
export const getVehicleDocuments = async (vehicleId) => {
  try {
    const res = await vehicleApi.getById(vehicleId);
    const docsObj = res.data?.data?.documents || {};
    
    const docsArray = [];
    const categories = {
      rc: "Registration Certificate (RC)",
      insurance: "Insurance Certificate",
      puc: "Pollution Under Control (PUC)",
      fitness: "Fitness Certificate",
      permit: "Permit Document",
      roadTax: "Road Tax Receipt"
    };
    
    Object.keys(categories).forEach(key => {
      const doc = docsObj[key];
      if (doc) {
        docsArray.push({
          id: key,
          name: doc.fileName || doc.originalName || categories[key],
          category: categories[key],
          documentNumber: doc.documentNumber || "",
          issueDate: doc.issueDate || doc.uploadDate || "",
          expiryDate: doc.expiryDate || "",
          notes: doc.notes || "",
          uploadDate: doc.uploadDate || doc.uploadedAt || new Date().toISOString(),
          uploadedBy: doc.uploadedBy || "Manager",
          status: getDocumentStatus(doc.expiryDate),
          fileData: resolveDocumentUrl(doc.fileUrl || ""),
          fileName: doc.fileName || doc.originalName || "",
          fileSize: doc.fileSize || 0,
          fileType: doc.mimeType || ""
        });
      }
    });
    
    return docsArray;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const uploadVehicleDocument = async (vehicleId, formData) => {
  try {
    const res = await vehicleApi.getById(vehicleId);
    const vehicle = res.data?.data;
    if (!vehicle) throw new Error("Vehicle not found");

    const fileObj = formData.get("file");
    if (!fileObj) throw new Error("No file selected");

    // 1. Upload to Cloudinary first
    const uploadRes = await vehicleApi.uploadDocument(fileObj);
    const uploadData = uploadRes.data?.data || uploadRes.data;

    const newDocument = {
      id: Math.random().toString(36).substring(2, 11),
      name: formData.get("documentName"),
      category: formData.get("category"),
      documentNumber: formData.get("documentNumber") || "",
      issueDate: formData.get("issueDate"),
      expiryDate: formData.get("expiryDate"),
      notes: formData.get("notes") || "",
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: "Manager",
      status: "Valid",
      fileUrl: uploadData.secure_url || uploadData.url,
      fileData: resolveDocumentUrl(uploadData.secure_url || uploadData.url),
      public_id: uploadData.public_id,
      fileName: fileObj.name,
      fileSize: fileObj.size,
      fileType: fileObj.type
    };

    const docsObj = vehicle.documents || {};
    const categories = {
      rc: "Registration Certificate (RC)",
      insurance: "Insurance Certificate",
      puc: "Pollution Under Control (PUC)",
      fitness: "Fitness Certificate",
      permit: "Permit Document",
      roadTax: "Road Tax Receipt"
    };
    
    const docsArray = [];
    Object.keys(categories).forEach(key => {
      const doc = docsObj[key];
      if (doc) {
        docsArray.push({
          id: key,
          name: doc.fileName || doc.originalName || categories[key],
          category: categories[key],
          documentNumber: doc.documentNumber || "",
          issueDate: doc.issueDate || doc.uploadDate || "",
          expiryDate: doc.expiryDate || "",
          notes: doc.notes || "",
          uploadDate: doc.uploadDate || doc.uploadedAt || new Date().toISOString(),
          uploadedBy: doc.uploadedBy || "Manager",
          status: getDocumentStatus(doc.expiryDate),
          fileUrl: doc.fileUrl || "",
          fileData: resolveDocumentUrl(doc.fileUrl || ""),
          fileName: doc.fileName || doc.originalName || "",
          fileSize: doc.fileSize || 0,
          fileType: doc.mimeType || "",
          public_id: doc.public_id || ""
        });
      }
    });

    const documents = [...docsArray, newDocument];
    await vehicleApi.update(vehicleId, { documents });
    
    return newDocument;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

/**
 * Replace an existing document
 * @param {string} vehicleId - Vehicle MongoDB ID
 * @param {string} documentId - Document ID to replace
 * @param {FormData} formData - New document data
 * @returns {Promise} Updated document
 */
export const replaceVehicleDocument = async (vehicleId, documentId, formData) => {
  try {
    const res = await vehicleApi.getById(vehicleId);
    const vehicle = res.data?.data;
    if (!vehicle) throw new Error("Vehicle not found");

    const fileObj = formData.get("file");
    if (!fileObj) throw new Error("No file selected");

    // 1. Upload to Cloudinary first
    const uploadRes = await vehicleApi.uploadDocument(fileObj);
    const uploadData = uploadRes.data?.data || uploadRes.data;

    const docsObj = vehicle.documents || {};
    const categories = {
      rc: "Registration Certificate (RC)",
      insurance: "Insurance Certificate",
      puc: "Pollution Under Control (PUC)",
      fitness: "Fitness Certificate",
      permit: "Permit Document",
      roadTax: "Road Tax Receipt"
    };
    
    const docsArray = [];
    Object.keys(categories).forEach(key => {
      const doc = docsObj[key];
      if (doc) {
        docsArray.push({
          id: key,
          name: doc.fileName || doc.originalName || categories[key],
          category: categories[key],
          documentNumber: doc.documentNumber || "",
          issueDate: doc.issueDate || doc.uploadDate || "",
          expiryDate: doc.expiryDate || "",
          notes: doc.notes || "",
          uploadDate: doc.uploadDate || doc.uploadedAt || new Date().toISOString(),
          uploadedBy: doc.uploadedBy || "Manager",
          status: getDocumentStatus(doc.expiryDate),
          fileUrl: doc.fileUrl || "",
          fileData: resolveDocumentUrl(doc.fileUrl || ""),
          fileName: doc.fileName || doc.originalName || "",
          fileSize: doc.fileSize || 0,
          fileType: doc.mimeType || "",
          public_id: doc.public_id || ""
        });
      }
    });

    const docIndex = docsArray.findIndex(d => d.id === documentId);
    if (docIndex === -1) throw new Error("Document not found");

    const updatedDocument = {
      ...docsArray[docIndex],
      name: formData.get("documentName"),
      category: formData.get("category"),
      documentNumber: formData.get("documentNumber") || "",
      issueDate: formData.get("issueDate"),
      expiryDate: formData.get("expiryDate"),
      notes: formData.get("notes") || "",
      fileUrl: uploadData.secure_url || uploadData.url,
      fileData: resolveDocumentUrl(uploadData.secure_url || uploadData.url),
      public_id: uploadData.public_id,
      fileName: fileObj.name,
      fileSize: fileObj.size,
      fileType: fileObj.type,
      replacedDate: new Date().toISOString().split('T')[0]
    };

    const documents = docsArray.map(d => d.id === documentId ? updatedDocument : d);
    await vehicleApi.update(vehicleId, { documents });
    
    return updatedDocument;
  } catch (error) {
    console.error("Error replacing document:", error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} vehicleId - Vehicle MongoDB ID
 * @param {string} documentId - Document ID to delete
 * @returns {Promise} Success response
 */
export const deleteVehicleDocument = async (vehicleId, documentId) => {
  try {
    const res = await vehicleApi.getById(vehicleId);
    const vehicle = res.data?.data;
    if (!vehicle) throw new Error("Vehicle not found");

    const docsObj = vehicle.documents || {};
    const categories = {
      rc: "Registration Certificate (RC)",
      insurance: "Insurance Certificate",
      puc: "Pollution Under Control (PUC)",
      fitness: "Fitness Certificate",
      permit: "Permit Document",
      roadTax: "Road Tax Receipt"
    };
    
    const docsArray = [];
    Object.keys(categories).forEach(key => {
      const doc = docsObj[key];
      if (doc) {
        docsArray.push({
          id: key,
          name: doc.fileName || doc.originalName || categories[key],
          category: categories[key],
          documentNumber: doc.documentNumber || "",
          issueDate: doc.issueDate || doc.uploadDate || "",
          expiryDate: doc.expiryDate || "",
          notes: doc.notes || "",
          uploadDate: doc.uploadDate || doc.uploadedAt || new Date().toISOString(),
          uploadedBy: doc.uploadedBy || "Manager",
          status: getDocumentStatus(doc.expiryDate),
          fileData: resolveDocumentUrl(doc.fileUrl || ""),
          fileName: doc.fileName || doc.originalName || "",
          fileSize: doc.fileSize || 0,
          fileType: doc.mimeType || ""
        });
      }
    });

    const documents = docsArray.filter(d => d.id !== documentId);
    await vehicleApi.update(vehicleId, { documents });
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
export const downloadVehicleDocument = (doc) => {
  try {
    const link = window.document.createElement("a");
    link.href = doc.fileData;
    link.download = doc.fileName;
    link.click();
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
};

/**
 * Get a specific document by ID
 * @param {string} vehicleId - Vehicle MongoDB ID
 * @param {string} documentId - Document ID
 * @returns {Promise} Document data
 */
export const getDocumentById = async (vehicleId, documentId) => {
  try {
    const res = await vehicleApi.getById(vehicleId);
    const vehicle = res.data?.data;
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
