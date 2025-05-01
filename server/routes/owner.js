import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Accommodation from '../models/Accommodation.js';
import upload from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/accommodations', auth, requireRole(['owner']), upload.array('images', 10), async (req, res) => {
  try {
    // Upload images sequentially to avoid race conditions
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'waytopg_accommodations');
          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue with the rest of the images if one fails
        }
      }
    }

    // Parse and validate the body data
    const amenities = JSON.parse(req.body.amenities || '[]');
    const rules = JSON.parse(req.body.rules || '[]');
    
    // Create and save the accommodation
    const accommodation = new Accommodation({
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      price: req.body.price,
      type: req.body.type,
      roomType: req.body.roomType,
      owner: req.user._id,
      images: uploadedImages,
      amenities: amenities.filter(Boolean), // Remove any empty values
      rules: rules.filter(Boolean) // Remove any empty values
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

router.delete('/accommodations/:id', auth, requireRole(['owner']), async (req, res) => {
  try {
    const accommodation = await Accommodation.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Delete images from Cloudinary
    const deletePromises = accommodation.images.map(image => 
      deleteFromCloudinary(image.public_id)
    );
    await Promise.all(deletePromises);

    // Delete the accommodation
    await Accommodation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    res.status(500).json({ message: 'Error deleting accommodation' });
  }
});

router.put('/accommodations/:id', auth, requireRole(['owner']), upload.array('images', 10), async (req, res) => {
  try {
    // Find the accommodation and verify ownership
    const accommodation = await Accommodation.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Handle image updates
    const existingImages = JSON.parse(req.body.existingImages || '[]');
    const imagesToDelete = accommodation.images.filter(
      img => !existingImages.find(existImg => existImg.public_id === img.public_id)
    );

    // Delete removed images from Cloudinary
    for (const image of imagesToDelete) {
      try {
        await deleteFromCloudinary(image.public_id);
      } catch (error) {
        console.error('Error deleting image:', error);
        // Continue if one image fails to delete
      }
    }

    // Upload new images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'waytopg_accommodations');
          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue with the rest of the images if one fails
        }
      }
    }

    // Parse arrays from form data
    const amenities = JSON.parse(req.body.amenities || '[]');
    const rules = JSON.parse(req.body.rules || '[]');

    // Update the accommodation
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        address: req.body.address,
        city: req.body.city,
        price: req.body.price,
        type: req.body.type,
        roomType: req.body.roomType,
        images: [...existingImages, ...uploadedImages],
        amenities: amenities.filter(Boolean),
        rules: rules.filter(Boolean)
      },
      { new: true }
    );

    res.json(updatedAccommodation);
  } catch (error) {
    console.error('Error updating accommodation:', error);
    res.status(400).json({ message: 'Error updating accommodation' });
  }
});

export default router;