import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ownerRoutes from './routes/owner.js';
import studentRoutes from './routes/student.js';
import accommodationRoutes from './routes/accommodations.js';

dotenv.config();

const app = express();

// app.use(cors());
app.use(cors({
  origin: [
    'https://waytopg.netlify.app',
    'https://waytopgdev.netlify.app',
    'http://localhost:5173'
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
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Server is up and running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});