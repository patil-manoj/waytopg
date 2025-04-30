import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Booking from '../models/Booking.js';

const router = express.Router();

router.get('/bookings', auth, requireRole(['student']), async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id }).populate('accommodation');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.post('/book', auth, requireRole(['student']), async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      student: req.user._id
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking' });
  }
});

export default router;