import express from 'express';
import Accommodation from '../models/Accommodation.js';

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

export default router;
