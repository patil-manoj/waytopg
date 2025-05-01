import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/user.js';
import Accommodation from '../models/Accommodation.js';
import Booking from '../models/Booking.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

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

export default router;