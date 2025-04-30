import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadToCloudinary = async (buffer, folder = 'accommodations') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      // Convert buffer to stream and pipe to cloudinary
      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting from Cloudinary: ${error.message}`);
  }
};
