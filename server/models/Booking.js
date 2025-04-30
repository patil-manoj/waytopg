import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  accommodation: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
});

export default mongoose.model('Booking', bookingSchema);