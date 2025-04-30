import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Accommodation from '../models/Accommodation.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/accommodations', auth, requireRole(['owner']), upload.array('images', 10), async (req, res) => {
  try {
    const imageUploadPromises = req.files?.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'waytopg_accommodations',
      });
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    }) || [];

    const uploadedImages = await Promise.all(imageUploadPromises);

    const accommodation = new Accommodation({
      ...req.body,
      owner: req.user._id,
      images: uploadedImages,
      amenities: JSON.parse(req.body.amenities || '[]'),
      rules: JSON.parse(req.body.rules || '[]')
    });
    
    await accommodation.save();
    res.status(201).json(accommodation);
  } catch (error) {
    console.error('Error creating accommodation:', error);
    res.status(400).json({ message: 'Error creating accommodation' });
  }
});

router.get('/accommodations', auth, requireRole(['owner']), async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ owner: req.user._id });
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accommodations' });
  }
});

export default router;