import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  accommodation: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  message: { type: String },
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);