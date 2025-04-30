import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import User from '../models/user.js';

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
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'owner', 'admin']),
  body('companyName').if(body('role').equals('owner')).notEmpty(),
  body('businessRegistration').if(body('role').equals('owner')).notEmpty(),
  body('adminCode').if(body('role').equals('admin')).notEmpty(),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  // body('role').isIn(['student', 'owner', 'admin']),
];

router.post('/signup', validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    
    const { name, email, password, role, companyName, businessRegistration, adminCode } = req.body;
    console.log(email);
    console.log(password);
    console.log(role);

    console.log(companyName);
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate role-specific fields
    if (role === 'owner' && (!companyName || !businessRegistration)) {
      return res.status(400).json({ message: 'Company name and business registration are required for owners' });
    }

    if (role === 'admin') {
      // Check admin code (you should store this securely, not hardcoded)
      const validAdminCode = process.env.ADMIN_SIGNUP_CODE;
      if (adminCode !== validAdminCode) {
        return res.status(403).json({ message: 'Invalid admin code' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      companyName: role === 'owner' ? companyName : undefined,
      businessRegistration: role === 'owner' ? businessRegistration : undefined,
    });

    await user.save();


    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // console.log('done3');
    res.status(201).json({ token, role: user.role });
    // console.log('done4');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);

    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    console.log("user.password");
    console.log(user.password);
    // Check if the password matches

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the role matches after finding the user
    // if (role !== user.role) {
    //   return res.status(401).json({ message: 'Invalid user type' });
    // }
    
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