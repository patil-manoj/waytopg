// import { Request, Response, NextFunction } from 'express';
import pkg from 'express';
const { Request, Response, NextFunction } = pkg;
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// interface AuthRequest extends Request {
//   user?: any;
// }

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the role in the token matches the user's current role
    if (user.role !== decoded.role) {
      return res.status(401).json({ message: 'Token role mismatch' });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      ...user.toObject()
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Role required: ' + roles.join(' or ') });
    }
    next();
  };
};