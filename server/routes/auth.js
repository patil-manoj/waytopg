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

// Firebase phone verification is handled on the client side
// We only need to handle user creation after verification

// Complete signup after phone verification
router.post('/complete-signup', async (req, res) => {
  try {
    const { name, phoneNumber, email, password, role, companyName, businessRegistration } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: 'Name, phone number, password, and role are required' });
    }
    
    // Validate phone verification
    if (!req.body.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone number must be verified before signup' });
    }

    // Validate owner-specific fields
    if (role === 'owner' && (!companyName || !businessRegistration)) {
      return res.status(400).json({ message: 'Company name and business registration are required for owners' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check for existing user with same phone number
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Check for existing user with same email if provided
    if (email) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Create new user
    const user = new User({
      name,
      phoneNumber,
      email: email || undefined,
      password: hashedPassword,
      role,
      isPhoneVerified: true,
      isEmailVerified: false,
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

// Validation middleware
const validateSignup = [
  body('name').trim().isLength({ min: 2 }).escape(),
  body('phoneNumber')
    .notEmpty()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('email').isEmail().normalizeEmail(),
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

    // Email is no longer required to be unique
    // We'll use phone number as the primary identifier

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

    // Create new user
    const user = new User({
      name,
      phoneNumber,
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
    res.status(201).json({ token, role: user.role });
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

    const { phoneNumber, password } = req.body;
    
    // Find user by phone number instead of email
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
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

// Admin login route
router.post('/admin-login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, password } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Send email verification code
router.post('/send-email-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

    // Save the code and expiration time
    user.emailVerificationCode = verificationCode;
    user.verificationCodeExpires = expirationTime;
    await user.save();

    // TODO: Integrate with your email service provider
    // For now, just return the code in the response
    res.json({ message: 'Verification code sent', code: verificationCode });
  } catch (error) {
    console.error('Error sending email verification:', error);
    res.status(500).json({ message: 'Error sending verification code' });
  }
});

// Send phone verification code
router.post('/send-phone-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone number is already verified' });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

    // Save the code and expiration time
    user.phoneVerificationCode = verificationCode;
    user.verificationCodeExpires = expirationTime;
    await user.save();

    // TODO: Integrate with your SMS service provider
    // For now, just return the code in the response
    res.json({ message: 'Verification code sent', code: verificationCode });
  } catch (error) {
    console.error('Error sending phone verification:', error);
    res.status(500).json({ message: 'Error sending verification code' });
  }
});

// Verify email code
router.post('/verify-email', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!user.emailVerificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Please request a new verification code' });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    if (code !== user.emailVerificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
});

// Verify phone code
router.post('/verify-phone', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone number is already verified' });
    }

    if (!user.phoneVerificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Please request a new verification code' });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    if (code !== user.phoneVerificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Error verifying phone:', error);
    res.status(500).json({ message: 'Error verifying phone number' });
  }
});

export default router;