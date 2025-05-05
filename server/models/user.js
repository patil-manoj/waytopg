import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number`
    }
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(v);
      },
      message: props => `${props.value} is not a valid password. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.`
    }
  },
  role: { 
    type: String, 
    enum: ['student', 'owner', 'admin'], 
    default: 'student' 
  },
  companyName: { 
    type: String, 
    required: function() { return this.role === 'owner'; },
    trim: true
  },
  businessRegistration: { 
    type: String, 
    required: function() { return this.role === 'owner'; },
    trim: true
  },
  isApproved: { 
    type: Boolean, 
    default: function() { return this.role !== 'owner'; } 
  },
}, {
  timestamps: true
});

// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 12);
//   }
//   next();
// });

// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;