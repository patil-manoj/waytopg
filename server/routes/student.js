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
    // Check if accommodation exists and is available
    const accommodation = await Accommodation.findById(req.body.accommodation);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    if (accommodation.status !== 'available') {
      return res.status(400).json({ message: 'Accommodation is not available for booking' });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    let newBooking;
    
    try {
      await session.withTransaction(async () => {
        // Create the booking
        const booking = new Booking({
          accommodation: req.body.accommodation,
          student: req.user._id,
          checkIn: new Date(req.body.checkIn),
          checkOut: new Date(req.body.checkOut),
          status: 'confirmed'
        });

        // Save the booking
        newBooking = await booking.save({ session });

        // Update accommodation status
        accommodation.status = 'booked';
        await accommodation.save({ session });
      });
    } finally {
      await session.endSession();
    }

    // Return the booking with populated accommodation details
    const populatedBooking = await Booking.findById(newBooking._id)
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
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // If the check-in date is within 48 hours, don't allow cancellation
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 48) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking within 48 hours of check-in' 
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Make accommodation available again
    const accommodation = await Accommodation.findById(booking.accommodation);
    if (accommodation) {
      accommodation.status = 'available';
      await accommodation.save();
    }

    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

export default router;