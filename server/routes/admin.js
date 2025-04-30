import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users });
  } catch (error) {
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
    res.status(500).json({ message: 'Error approving owner' });
  }
});

export default router;