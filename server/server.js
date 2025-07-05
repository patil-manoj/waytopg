import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ownerRoutes from './routes/owner.js';
import studentRoutes from './routes/student.js';
import accommodationRoutes from './routes/accommodations.js';

dotenv.config();

const app = express();

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'present' : 'not present'
    }
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});

// Test endpoint to verify routes
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint hit');
  res.json({ message: 'API is working' });
});

// app.use(cors());
app.use(cors({
  origin: [
    process.env.VITE_FRONTEND_URL,
    process.env.VITE_FRONTEND_DEV_URL,
    process.env.VITE_API_BASE_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/accommodations', accommodationRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    console.error('MongoDB connection error:', err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Health check endpoint
app.get('/ping', (req, res) => {
  logger.info('Health check pinged');
  res.status(200).json({ message: 'Server is up and running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});