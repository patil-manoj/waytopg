import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  price: { type: Number, required: true },
  amenities: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ 
    url: String,
    public_id: String
  }],
});

export default mongoose.model('Accommodation', accommodationSchema);