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
    required: false, // Make email optional
    trim: true,
    lowercase: true,
    sparse: true, // Allow null/undefined while maintaining unique index
    validate: {
      validator: function(v) {
        // Skip validation if email is not provided
        return !v || validator.isEmail(v);
      },
      message: 'Please provide a valid email'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
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
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: true  // Since we verify with Firebase before creating the user
  }
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