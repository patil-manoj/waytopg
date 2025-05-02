import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/user.js';
import Accommodation from '../models/Accommodation.js';
import Booking from '../models/Booking.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const [
      totalUsers,
      pendingApprovals,
      totalAccommodations,
      totalBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'owner', isApproved: false }),
      Accommodation.countDocuments(),
      Booking.countDocuments()
    ]);

    res.json({
      totalUsers,
      pendingApprovals,
      totalAccommodations,
      totalBookings
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post('/approve-owner/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'owner') {
      return res.status(404).json({ message: 'User not found or not an owner' });
    }
    user.isApproved = true;
    await user.save();
    res.json({ message: 'Owner approved successfully' });
  } catch (error) {
    console.error('Error approving owner:', error);
    res.status(500).json({ message: 'Error approving owner' });
  }
});

// Get all accommodations
router.get('/accommodations', auth, requireRole(['admin']), async (req, res) => {
  try {
    const accommodations = await Accommodation.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json({ accommodations });
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ message: 'Error fetching accommodations' });
  }
});

router.delete('/users/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If deleting an owner, also delete their accommodations
    if (user.role === 'owner') {
      // Delete images from Cloudinary first
      const accommodations = await Accommodation.find({ owner: user._id });
      for (const acc of accommodations) {
        if (acc.images && acc.images.length > 0) {
          const deletePromises = acc.images.map(image => 
            deleteFromCloudinary(image.public_id)
          );
          await Promise.all(deletePromises);
        }
      }
      // Then delete the accommodations
      await Accommodation.deleteMany({ owner: user._id });
    }

    // If the user has any bookings, delete them
    await Booking.deleteMany({ user: user._id });
    
    // Finally delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Admin: Add new accommodation
router.post('/accommodations', auth, requireRole(['admin']), upload.array('images', 10), async (req, res) => {
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
        }
      }
    }

    const amenities = JSON.parse(req.body.amenities || '[]');
    const rules = JSON.parse(req.body.rules || '[]');
    
    const accommodation = new Accommodation({
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      price: req.body.price,
      type: req.body.type,
      roomType: req.body.roomType,
      owner: req.body.ownerId, // Admin can specify the owner
      images: uploadedImages,
      amenities: amenities.filter(Boolean),
      rules: rules.filter(Boolean),
      mapLink: req.body.mapLink,
      capacity: req.body.capacity,
      status: req.body.status,
      gender: req.body.gender,
      furnishing: req.body.furnishing,
      securityDeposit: req.body.securityDeposit,
      foodAvailable: req.body.foodAvailable,
      foodPrice: req.body.foodPrice,
      maintenanceCharges: req.body.maintenanceCharges,
      electricityIncluded: req.body.electricityIncluded,
      waterIncluded: req.body.waterIncluded,
      noticePeriod: req.body.noticePeriod
    });
    
    await accommodation.save();
    res.status(201).json(accommodation);
  } catch (error) {
    console.error('Error creating accommodation:', error);
    res.status(400).json({ message: 'Error creating accommodation' });
  }
});

// Admin: Update accommodation
router.put('/accommodations/:id', auth, requireRole(['admin']), upload.array('images', 10), async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
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
        }
      }
    }

    const amenities = JSON.parse(req.body.amenities || '[]');
    const rules = JSON.parse(req.body.rules || '[]');

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
        owner: req.body.ownerId, // Admin can change the owner
        images: [...existingImages, ...uploadedImages],
        amenities: amenities.filter(Boolean),
        rules: rules.filter(Boolean),
        mapLink: req.body.mapLink,
        capacity: req.body.capacity,
        status: req.body.status,
        gender: req.body.gender,
        furnishing: req.body.furnishing,
        securityDeposit: req.body.securityDeposit,
        foodAvailable: req.body.foodAvailable,
        foodPrice: req.body.foodPrice,
        maintenanceCharges: req.body.maintenanceCharges,
        electricityIncluded: req.body.electricityIncluded,
        waterIncluded: req.body.waterIncluded,
        noticePeriod: req.body.noticePeriod
      },
      { new: true }
    );

    res.json(updatedAccommodation);
  } catch (error) {
    console.error('Error updating accommodation:', error);
    res.status(400).json({ message: 'Error updating accommodation' });
  }
});

// Admin: Delete accommodation
router.delete('/accommodations/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Delete images from Cloudinary
    if (accommodation.images && accommodation.images.length > 0) {
      const deletePromises = accommodation.images.map(async (image) => {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (error) {
          console.error(`Error deleting image ${image.public_id} from Cloudinary:`, error);
          // Continue with other images even if one fails
        }
      });
      await Promise.all(deletePromises);
    }

    // Delete the accommodation from database
    await Accommodation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    res.status(500).json({ message: 'Error deleting accommodation' });
  }
});

export default router;