import express from 'express';
import { auth } from '../middleware/auth.js';
import Accommodation from '../models/Accommodation.js';
import User from '../models/user.js';
import { sendOwnerNotification } from '../utils/email.js';

const router = express.Router();

// Get all approved accommodations
router.get('/', async (req, res) => {
  try {
    // Only fetch accommodations from approved owners
    const accommodations = await Accommodation.find()
      .populate('owner', 'isApproved')
      .then(accs => accs.filter(acc => acc.owner.isApproved));

    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ message: 'Error fetching accommodations' });
  }
});

// Get single accommodation by ID
router.get('/:id', async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id)
      .populate('owner', 'name email isApproved');
    
    if (!accommodation || !accommodation.owner.isApproved) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    
    res.json(accommodation);
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    res.status(500).json({ message: 'Error fetching accommodation' });
  }
});

// Request accommodation details
router.post('/request-details', auth, async (req, res) => {
  try {
    const { accommodationId } = req.body;
    const student = await User.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const accommodation = await Accommodation.findById(accommodationId)
      .populate('owner', 'email');

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const ownerEmail = accommodation.owner.email;
    
    // Send email to owner
    const emailSent = await sendOwnerNotification(ownerEmail, {
      name: student.name,
      phoneNumber: student.phoneNumber,
      email: student.email
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send email notification' });
    }

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error in request-details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
