import express from 'express';
import mongoose from 'mongoose';
import { auth, requireRole } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Accommodation from '../models/Accommodation.js';

const router = express.Router();

router.get('/bookings', auth, requireRole(['student']), async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('accommodation', 'name address images')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.post('/book', auth, requireRole(['student']), async (req, res) => {
  try {
    // Log the user role and request info
    console.log('Booking request from user:', {
      userId: req.user._id,
      role: req.user.role,
      accommodationId: req.body.accommodation
    });

    // Check if accommodation exists
    const accommodation = await Accommodation.findById(req.body.accommodation);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Check if student already has a pending booking for this accommodation
    const existingBooking = await Booking.findOne({
      accommodation: req.body.accommodation,
      student: req.user._id,
      status: 'pending'
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: 'You already have a pending request for this accommodation' 
      });
    }

    // Create the booking request
    const booking = new Booking({
      accommodation: req.body.accommodation,
      student: req.user._id,
      status: 'pending',
      message: req.body.message || 'Interested in booking'
    });

    await booking.save();

    // Return the booking with populated accommodation details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('accommodation', 'name address images');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: 'Error creating booking' });
  }
});

router.put('/bookings/:id/cancel', auth, requireRole(['student']), async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id,
      student: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Request is already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling request' });
  }
});

export default router;