import path from 'path';
import cloudinary from './cloudinary.js';
import Document from '../models/Document.js';

export const uploadBase64ToCloudinary = (base64Data, originalName) => {
  if (!base64Data) return Promise.resolve(null);
  
  return new Promise((resolve) => {
    let fileBuffer;
    let mimeType = '';
    
    // Detect base64 data URL signature
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      fileBuffer = Buffer.from(matches[2], 'base64');
      mimeType = matches[1];
    } else {
      // If it's a raw base64 string, try decoding it directly
      try {
        fileBuffer = Buffer.from(base64Data, 'base64');
      } catch (e) {
        return resolve(null);
      }
    }
    
    const lowerName = (originalName || '').toLowerCase();
    const isPdf = lowerName.endsWith('.pdf') || mimeType.toLowerCase() === 'application/pdf';
    
    const originalNameWithoutExt = path.parse(originalName || '').name || 'document';
    let publicId = `${originalNameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    if (isPdf && !publicId.toLowerCase().endsWith('.pdf')) {
      publicId = `${publicId}.pdf`;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'fleet_documents',
        resource_type: isPdf ? 'raw' : 'auto',
        public_id: publicId
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          resolve(null);
        } else {
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
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
      let public_id = doc.public_id || '';
      if (doc.fileData) {
        const uploadRes = await uploadBase64ToCloudinary(doc.fileData, doc.name || doc.fileName);
        if (uploadRes) {
          fileUrl = uploadRes.secure_url;
          public_id = uploadRes.public_id;
        }
      }
      
      const originalName = doc.name || doc.fileName || doc.originalName || '';
      result[key] = {
        fileUrl: fileUrl || '',
        fileName: originalName,
        originalName: originalName,
        public_id: public_id,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
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
      let public_id = doc.public_id || '';
      if (doc.fileData) {
        const uploadRes = await uploadBase64ToCloudinary(doc.fileData, doc.originalName || doc.fileName);
        if (uploadRes) {
          fileUrl = uploadRes.secure_url;
          public_id = uploadRes.public_id;
        }
      }
      
      const originalName = doc.originalName || doc.fileName || doc.name || '';
      result[key] = {
        fileUrl: fileUrl || '',
        fileName: originalName,
        originalName: originalName,
        public_id: public_id,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
        uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
        fileSize: doc.fileSize || doc.size || 0,
        mimeType: doc.mimeType || doc.fileType || '',
        uploadedBy: doc.uploadedBy || (reqUser ? reqUser.name || reqUser.email : 'Manager')
      };
    }
  }

  return result;
};

export const syncVehicleDocumentsToCollection = async (vehicle, reqUser) => {
  if (!vehicle || !vehicle.documents) return;
  
  const categories = {
    rc: { title: "Registration Certificate (RC)", type: "RC" },
    insurance: { title: "Insurance Certificate", type: "Insurance" },
    puc: { title: "Pollution Under Control (PUC)", type: "PUC" },
    fitness: { title: "Fitness Certificate", type: "Fitness" },
    permit: { title: "Permit Document", type: "Permit" },
    roadTax: { title: "Road Tax Receipt", type: "Road Tax" }
  };
  
  const docsObj = vehicle.documents;
  
  const isPlaceholder = (url) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('placeholder') || lower.includes('dummy') || lower.includes('example') || lower.includes('broken');
  };
  
  for (const key of Object.keys(categories)) {
    const doc = docsObj[key];
    
    if (doc && doc.fileUrl && !isPlaceholder(doc.fileUrl)) {
      const expiryStr = doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : '';
      
      let status = 'Active';
      if (doc.expiryDate) {
        const today = new Date();
        const expiry = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) {
          status = 'Expired';
        } else if (daysUntilExpiry <= 30) {
          status = 'Expiring Soon';
        }
      }
      
      let sizeStr = '0 KB';
      if (doc.fileSize) {
        if (doc.fileSize >= 1024 * 1024) {
          sizeStr = `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`;
        } else {
          sizeStr = `${(doc.fileSize / 1024).toFixed(2)} KB`;
        }
      }
      
      const updateData = {
        title: categories[key].title,
        fileUrl: doc.fileUrl,
        secure_url: doc.fileUrl,
        type: categories[key].type,
        category: 'Vehicle Docs',
        vehicle: vehicle._id.toString(),
        public_id: doc.public_id || '',
        originalName: doc.originalName || doc.fileName || '',
        fileType: doc.mimeType || 'application/pdf',
        fileSize: sizeStr,
        status: status,
        expiry: expiryStr,
        uploadedBy: vehicle.assignedManager || reqUser?._id || vehicle.createdBy
      };
      
      await Document.findOneAndUpdate(
        { vehicle: vehicle._id.toString(), type: categories[key].type },
        updateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      await Document.findOneAndDelete({ vehicle: vehicle._id.toString(), type: categories[key].type });
    }
  }
};
