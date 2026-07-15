import path from 'path';
import cloudinary from './cloudinary.js';

export const uploadBase64ToCloudinary = (base64Data, originalName) => {
  if (!base64Data) return Promise.resolve(null);
  
  return new Promise((resolve) => {
    let fileBuffer;
    
    // Detect base64 data URL signature
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      fileBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // If it's a raw base64 string, try decoding it directly
      try {
        fileBuffer = Buffer.from(base64Data, 'base64');
      } catch (e) {
        return resolve(null);
      }
    }
    
    const originalNameWithoutExt = path.parse(originalName || '').name || 'document';
    const publicId = `${originalNameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'fleet_documents',
        resource_type: 'auto',
        public_id: publicId
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          resolve(null);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

export const processVehicleDocuments = async (docsInput, reqUser) => {
  const result = {
    rc: null,
    insurance: null,
    puc: null,
    fitness: null,
    permit: null,
    roadTax: null
  };

  if (!docsInput) return result;

  const mapCategoryToKey = (category = '') => {
    const cat = category.toLowerCase().replace(/[^a-z]/g, '');
    if (cat === 'rc') return 'rc';
    if (cat === 'insurance' || cat === 'insurancecertificate') return 'insurance';
    if (cat === 'puc' || cat === 'pollutionundercontrol' || cat === 'pollution') return 'puc';
    if (cat === 'fitness' || cat === 'fitnesscertificate') return 'fitness';
    if (cat === 'permit' || cat === 'permitdocument') return 'permit';
    if (cat === 'roadtax' || cat === 'roadtaxreceipt') return 'roadTax';
    return null;
  };

  // If docsInput is an array (like from AddVehiclePage)
  if (Array.isArray(docsInput)) {
    for (const doc of docsInput) {
      const key = mapCategoryToKey(doc.category || doc.name);
      if (!key) continue;
      
      let fileUrl = doc.fileUrl;
      if (doc.fileData) {
        const savedUrl = await uploadBase64ToCloudinary(doc.fileData, doc.name || doc.fileName);
        if (savedUrl) fileUrl = savedUrl;
      }
      
      const originalName = doc.name || doc.fileName || doc.originalName || '';
      result[key] = {
        fileUrl: fileUrl || '',
        fileName: originalName,
        originalName: originalName,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
        uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
        fileSize: doc.fileSize || doc.size || 0,
        mimeType: doc.mimeType || doc.fileType || '',
        uploadedBy: doc.uploadedBy || (reqUser ? reqUser.name || reqUser.email : 'Manager')
      };
    }
  } else if (typeof docsInput === 'object') {
    // If docsInput is an object (like from VehicleEditPage)
    for (const key of Object.keys(docsInput)) {
      const doc = docsInput[key];
      if (!doc) continue;
      
      let fileUrl = doc.fileUrl;
      if (doc.fileData) {
        const savedUrl = await uploadBase64ToCloudinary(doc.fileData, doc.originalName || doc.fileName);
        if (savedUrl) fileUrl = savedUrl;
      }
      
      const originalName = doc.originalName || doc.fileName || doc.name || '';
      result[key] = {
        fileUrl: fileUrl || '',
        fileName: originalName,
        originalName: originalName,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
        uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
        fileSize: doc.fileSize || doc.size || 0,
        mimeType: doc.mimeType || doc.fileType || '',
        uploadedBy: doc.uploadedBy || (reqUser ? reqUser.name || reqUser.email : 'Manager')
      };
    }
  }

  return result;
};
