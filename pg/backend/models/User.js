const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', null],  // allow null
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  name: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  registrationStep: {
    type: Number,
    default: 1 // 1: phone, 2: otp, 3: role, 4: picture, 5: name, 6: description
  }
}, {
  timestamps: true
});

// Check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  if (this.isPhoneVerified && this.role && this.name && this.description) {
    this.isProfileComplete = true;
    this.registrationStep = 6;
  }
  return this.isProfileComplete;
};

module.exports = mongoose.model('User', userSchema);
