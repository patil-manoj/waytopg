import express from 'express';
import { auth } from '../middleware/auth.js';
import Accommodation from '../models/Accommodation.js';
import User from '../models/user.js';
import { sendOwnerNotification } from '../utils/email.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all approved accommodations
router.get('/', async (req, res) => {
  try {
    // Only fetch accommodations from approved owners
    const accommodations = await Accommodation.find()
      .populate('owner', 'isApproved')
      .then(accs => accs.filter(acc => acc.owner.isApproved));

    logger.info('Fetched all accommodations', { count: accommodations.length });
    res.json(accommodations);
  } catch (error) {
    logger.error('Error fetching accommodations:', error);
    res.status(500).json({ message: 'Error fetching accommodations' });
  }
});

// Get single accommodation by ID
router.get('/:id', async (req, res) => {
  try {
    logger.info('Fetching accommodation by ID', { id: req.params.id });
    const accommodation = await Accommodation.findById(req.params.id)
      .populate('owner', 'name email isApproved');
    
    if (!accommodation || !accommodation.owner.isApproved) {
      logger.warn('Accommodation not found or owner not approved', { id: req.params.id });
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    
    logger.info('Accommodation found', { id: accommodation._id });
    res.json(accommodation);
  } catch (error) {
    logger.error('Error fetching accommodation:', error);
    res.status(500).json({ message: 'Error fetching accommodation' });
  }
});

// Request accommodation details
router.post('/request-details', auth, async (req, res) => {
  logger.info('Received request for accommodation details', { 
    body: req.body,
    userId: req.user?.userId,
    headers: req.headers 
  });

  try {
    const { accommodationId } = req.body;
    
    if (!accommodationId) {
      logger.warn('Missing accommodationId in request');
      return res.status(400).json({ message: 'accommodationId is required' });
    }

    const student = await User.findById(req.user._id);
    
    if (!student) {
      logger.warn('Student not found', { userId: req.user._id });
      return res.status(404).json({ message: 'Student not found' });
    }

    logger.info('Found student', { 
      studentId: student._id,
      studentName: student.name 
    });

    const accommodation = await Accommodation.findById(accommodationId)
      .populate('owner', 'email');

    if (!accommodation) {
      logger.warn('Accommodation not found', { accommodationId });
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    logger.info('Found accommodation', { 
      accommodationId: accommodation._id,
      ownerEmail: accommodation.owner.email 
    });

    const ownerEmail = accommodation.owner.email;
    
    // Send email to owner
    const emailSent = await sendOwnerNotification(ownerEmail, {
      name: student.name,
      phoneNumber: student.phoneNumber,
      email: student.email
    });

    if (!emailSent) {
      logger.error('Failed to send email notification', { 
        ownerEmail,
        studentId: student._id 
      });
      return res.status(500).json({ message: 'Failed to send email notification' });
    }

    logger.info('Email notification sent successfully', {
      ownerEmail,
      studentId: student._id
    });

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    logger.error('Error in request-details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
