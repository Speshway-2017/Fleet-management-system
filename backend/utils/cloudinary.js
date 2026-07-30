import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image buffer directly to Cloudinary
 * @param {Buffer} buffer - The image buffer from multer memoryStorage
 * @param {String} folder - Optional folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImageToCloudinary = (buffer, folder = 'fleet_management') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // End the stream by passing the buffer
    uploadStream.end(buffer);
  });
};

/**
 * Uploads a base64 image string directly to Cloudinary
 * @param {String} base64Data - Base64 data string
 * @param {String} folder - Destination folder in Cloudinary
 * @param {String} originalName - Original filename
 */
export const uploadBase64ImageToCloudinary = async (base64Data, folder = 'vehicles', originalName = 'vehicle_image') => {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto'
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      originalName: originalName || 'vehicle_image'
    };
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary by its public_id
 * @param {String} publicId - Cloudinary public_id
 */
export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, error);
    return null;
  }
};

export default cloudinary;
