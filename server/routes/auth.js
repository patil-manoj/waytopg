import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import User from '../models/user.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use(limiter);

// Validation middleware
const validateSignup = [
  body('name').trim().isLength({ min: 2 }).escape(),
  body('phoneNumber')
    .notEmpty()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'owner', 'admin']),
  body('companyName').if(body('role').equals('owner')).notEmpty(),
  body('businessRegistration').if(body('role').equals('owner')).notEmpty(),
  body('adminCode').if(body('role').equals('admin')).notEmpty(),
];

const validateLogin = [
  body('phoneNumber')
    .notEmpty()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('password').notEmpty(),
];

router.post('/signup', validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, email, password, role, companyName, businessRegistration, adminCode } = req.body;

    // Check if phone number already exists
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }

    // Check email if provided
    if (email) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Validate role-specific fields
    if (role === 'owner' && (!companyName || !businessRegistration)) {
      return res.status(400).json({ message: 'Company name and business registration are required for owners' });
    }

    if (role === 'admin') {
      const validAdminCode = process.env.ADMIN_SIGNUP_CODE;
      if (adminCode !== validAdminCode) {
        return res.status(403).json({ message: 'Invalid admin code' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      phoneNumber,
      email: email || undefined,
      password: hashedPassword,
      role,
      companyName: role === 'owner' ? companyName : undefined,
      businessRegistration: role === 'owner' ? businessRegistration : undefined,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, role: user.role });
  } catch (error) {
    console.error('Error completing signup:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, password } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'owner' && !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;