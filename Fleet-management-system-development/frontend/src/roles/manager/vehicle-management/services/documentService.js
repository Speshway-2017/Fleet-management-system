import { vehicleApi } from "@/api/vehicleApi";

export const resolveDocumentUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim();

  // Data URLs
  if (cleanUrl.startsWith("data:")) return cleanUrl;

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const backendBase = apiBase.replace(/\/api\/?$/, "");

  // Cloudinary / S3 / External Cloud Storage URLs
  if (
    cleanUrl.includes("cloudinary.com") ||
    cleanUrl.includes("amazonaws.com") ||
    cleanUrl.includes("storage.googleapis.com") ||
    cleanUrl.includes("blob.core.windows.net")
  ) {
    return cleanUrl;
  }

  // Localhost or 127.0.0.1 hardcoded URLs (from dev database / seeding)
  if (cleanUrl.includes("localhost:") || cleanUrl.includes("127.0.0.1:")) {
    if (backendBase && !backendBase.includes("localhost") && !backendBase.includes("127.0.0.1")) {
      cleanUrl = cleanUrl.replace(/^https?:\/\/[^\/]+/, backendBase);
    }
    return cleanUrl;
  }

  // Absolute HTTP / HTTPS URLs
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  // Relative paths (/uploads/..., uploads/...)
  if (cleanUrl.startsWith("/")) {
    cleanUrl = cleanUrl.substring(1);
  }
  if (cleanUrl.startsWith("uploads/")) {
    return `${apiBase}/${cleanUrl}`;
  }
  return `${backendBase}/${cleanUrl}`;
};

/**
 * Get all documents for a specific vehicle
 * @param {string} vehicleId - Vehicle MongoDB ID
 * @returns {Promise} Array of documents
 */
export const getVehicleDocuments = async (vehicleId) => {
  try {
    const res = await vehicleApi.getById(vehicleId);
    const vehicle = res.data?.data || res.data || {};
    const docsObj = vehicle.documents || {};
    
    const docsArray = [];
    const categories = {
      rc: "Registration Certificate (RC)",
      insurance: "Insurance Certificate",
      puc: "Pollution Under Control (PUC)",
      fitness: "Fitness Certificate",
      permit: "Permit Document",
      roadTax: "Road Tax Receipt"
    };

    const fallbacks = {
      rc: vehicle.rcUrl || vehicle.rcDocument,
      insurance: vehicle.insuranceUrl || vehicle.insuranceDocument,
      puc: vehicle.pucUrl || vehicle.pollutionUrl || vehicle.pucDocument,
      fitness: vehicle.fitnessUrl || vehicle.fitnessDocument,
      permit: vehicle.permitUrl || vehicle.permitDocument,
      roadTax: vehicle.roadTaxUrl || vehicle.roadTaxDocument
    };
    
    Object.keys(categories).forEach(key => {
      const doc = docsObj[key];
      let rawUrl = "";
      let docName = categories[key];
      let docNum = "";
      let issueDate = "";
      let expiryDate = "";
      let notes = "";
      let uploadDate = new Date().toISOString();
      let uploadedBy = "Manager";
      let fileSize = 0;
      let fileType = "";
      let fileName = "";
      let public_id = "";

      if (typeof doc === "string" && doc.trim()) {
        rawUrl = doc;
      } else if (doc && typeof doc === "object") {
        rawUrl = doc.fileUrl || doc.url || doc.secure_url || doc.path || "";
        docName = doc.fileName || doc.originalName || doc.name || categories[key];
        docNum = doc.documentNumber || "";
        issueDate = doc.issueDate || doc.uploadDate || "";
        expiryDate = doc.expiryDate || "";
        notes = doc.notes || "";
        uploadDate = doc.uploadDate || doc.uploadedAt || uploadDate;
        uploadedBy = doc.uploadedBy || "Manager";
        fileSize = doc.fileSize || 0;
        fileType = doc.mimeType || doc.fileType || "";
        fileName = doc.fileName || doc.originalName || "";
        public_id = doc.public_id || "";
      }

      if (!rawUrl && fallbacks[key]) {
        if (typeof fallbacks[key] === "string") {
          rawUrl = fallbacks[key];
        } else if (typeof fallbacks[key] === "object") {
          rawUrl = fallbacks[key].fileUrl || fallbacks[key].url || fallbacks[key].secure_url || "";
        }
      }

      if (rawUrl) {
        const resolvedUrl = resolveDocumentUrl(rawUrl);
        docsArray.push({
          id: key,
          name: docName,
          category: categories[key],
          documentNumber: docNum,
          issueDate: issueDate,
          expiryDate: expiryDate,
          notes: notes,
          uploadDate: uploadDate,
          uploadedBy: uploadedBy,
          status: getDocumentStatus(expiryDate),
          fileUrl: rawUrl,
          fileData: resolvedUrl,
          url: resolvedUrl,
          fileName: fileName || `${categories[key].replace(/[\s()]+/g, "_")}.png`,
          fileSize: fileSize,
          fileType: fileType,
          public_id: public_id
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
    const vehicle = res.data?.data || res.data;
    if (!vehicle) throw new Error("Vehicle not found");

    const fileObj = formData.get("file");
    if (!fileObj) throw new Error("No file selected");

    // 1. Upload to Cloudinary first
    const uploadRes = await vehicleApi.uploadDocument(fileObj);
    const uploadData = uploadRes.data?.data || uploadRes.data || {};
    const uploadedUrl = uploadData.secure_url || uploadData.url || uploadData.fileUrl || "";

    const category = formData.get("category");
    const categoryKeyMap = {
      "Registration Certificate (RC)": "rc",
      "Insurance Certificate": "insurance",
      "Pollution Under Control (PUC)": "puc",
      "Fitness Certificate": "fitness",
      "Permit Document": "permit",
      "Road Tax Receipt": "roadTax"
    };

    const docKey = categoryKeyMap[category] || "rc";

    const newDocObj = {
      fileUrl: uploadedUrl,
      public_id: uploadData.public_id || "",
      fileName: fileObj.name,
      originalName: fileObj.name,
      uploadDate: new Date().toISOString(),
      expiryDate: formData.get("expiryDate") || null,
      uploadedAt: new Date().toISOString(),
      fileSize: Math.round(fileObj.size / 1024),
      mimeType: fileObj.type,
      uploadedBy: "Manager",
      documentNumber: formData.get("documentNumber") || "",
      notes: formData.get("notes") || ""
    };

    const currentDocs = vehicle.documents || {};
    const updatedDocs = {
      ...currentDocs,
      [docKey]: newDocObj
    };

    await vehicleApi.update(vehicleId, { documents: updatedDocs });

    const resolvedUrl = resolveDocumentUrl(uploadedUrl);
    return {
      id: docKey,
      name: formData.get("documentName") || category,
      category: category,
      documentNumber: formData.get("documentNumber") || "",
      issueDate: formData.get("issueDate") || "",
      expiryDate: formData.get("expiryDate") || "",
      notes: formData.get("notes") || "",
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "Manager",
      status: getDocumentStatus(formData.get("expiryDate")),
      fileUrl: uploadedUrl,
      fileData: resolvedUrl,
      url: resolvedUrl,
      public_id: uploadData.public_id || "",
      fileName: fileObj.name,
      fileSize: Math.round(fileObj.size / 1024),
      fileType: fileObj.type
    };
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
    const vehicle = res.data?.data || res.data;
    if (!vehicle) throw new Error("Vehicle not found");

    const fileObj = formData.get("file");
    if (!fileObj) throw new Error("No file selected");

    // 1. Upload to Cloudinary first
    const uploadRes = await vehicleApi.uploadDocument(fileObj);
    const uploadData = uploadRes.data?.data || uploadRes.data || {};
    const uploadedUrl = uploadData.secure_url || uploadData.url || uploadData.fileUrl || "";

    const category = formData.get("category");
    const categoryKeyMap = {
      "Registration Certificate (RC)": "rc",
      "Insurance Certificate": "insurance",
      "Pollution Under Control (PUC)": "puc",
      "Fitness Certificate": "fitness",
      "Permit Document": "permit",
      "Road Tax Receipt": "roadTax"
    };

    const docKey = categoryKeyMap[category] || documentId || "rc";

    const updatedDocObj = {
      fileUrl: uploadedUrl,
      public_id: uploadData.public_id || "",
      fileName: fileObj.name,
      originalName: fileObj.name,
      uploadDate: new Date().toISOString(),
      expiryDate: formData.get("expiryDate") || null,
      uploadedAt: new Date().toISOString(),
      fileSize: Math.round(fileObj.size / 1024),
      mimeType: fileObj.type,
      uploadedBy: "Manager",
      documentNumber: formData.get("documentNumber") || "",
      notes: formData.get("notes") || ""
    };

    const currentDocs = vehicle.documents || {};
    const updatedDocs = {
      ...currentDocs,
      [docKey]: updatedDocObj
    };

    await vehicleApi.update(vehicleId, { documents: updatedDocs });
    const resolvedUrl = resolveDocumentUrl(uploadedUrl);

    return {
      id: docKey,
      name: formData.get("documentName") || category,
      category: category,
      documentNumber: formData.get("documentNumber") || "",
      issueDate: formData.get("issueDate") || "",
      expiryDate: formData.get("expiryDate") || "",
      notes: formData.get("notes") || "",
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "Manager",
      status: getDocumentStatus(formData.get("expiryDate")),
      fileUrl: uploadedUrl,
      fileData: resolvedUrl,
      url: resolvedUrl,
      public_id: uploadData.public_id || "",
      fileName: fileObj.name,
      fileSize: Math.round(fileObj.size / 1024),
      fileType: fileObj.type
    };
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
    const vehicle = res.data?.data || res.data;
    if (!vehicle) throw new Error("Vehicle not found");

    const currentDocs = { ...(vehicle.documents || {}) };
    delete currentDocs[documentId];

    await vehicleApi.update(vehicleId, { documents: currentDocs });
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
    link.href = doc.fileData || doc.url || resolveDocumentUrl(doc.fileUrl);
    link.download = doc.fileName || `${doc.name || "document"}.pdf`;
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
    const docs = await getVehicleDocuments(vehicleId);
    const document = docs.find(d => d.id === documentId);
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
