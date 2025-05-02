import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true, enum: ['apartment', 'house', 'hostel', 'pg', 'studio', 'suite', 'dorm'] },
  roomType: { type: String, required: true, enum: ['single', 'double', 'triple', 'studio'] },
  amenities: [String],
  rules: [String],
  rating: { type: Number, default: 4.5 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ 
    url: String,
    public_id: String
  }],
  mapLink: { type: String },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
  gender: { type: String, enum: ['male', 'female', 'any'], required: true },
  furnishing: { type: String, enum: ['furnished', 'semi-furnished', 'unfurnished'], required: true },
  securityDeposit: { type: Number, required: true },
  foodAvailable: { type: Boolean, default: false },
  foodPrice: { type: Number },  // Monthly food charges if food is available
  maintenanceCharges: { type: Number, default: 0 },  // Monthly maintenance charges
  electricityIncluded: { type: Boolean, default: false },
  waterIncluded: { type: Boolean, default: false },
  noticePeriod: { type: Number, default: 30 },  // Notice period in days
}, {
  timestamps: true
});

export default mongoose.model('Accommodation', accommodationSchema);