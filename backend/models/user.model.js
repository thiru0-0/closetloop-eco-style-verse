const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(password) {
        // At least 8 characters, 1 uppercase, 1 number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);
      },
      message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number'
    }
  },
  role: {
    type: String,
    enum: ['user', 'retailer', 'admin'],
    default: 'user'
  },
  // Retailer-specific fields
  storeName: {
    type: String,
    trim: true,
    maxlength: 100,
    required: function() { return this.role === 'retailer'; }
  },
  gstNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number'],
    required: function() { return this.role === 'retailer'; }
  },
  businessLicense: {
    type: String, // URL or file path
    trim: true,
    required: false // Make it optional
  },
  storeAddress: {
    type: String,
    trim: true,
    maxlength: 500,
    required: function() { return this.role === 'retailer'; }
  },
  pincode: {
    type: String,
    trim: true,
    match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'],
    required: function() { return this.role === 'retailer'; }
  },
  storeCategory: {
    type: String,
    trim: true,
    maxlength: 100,
    required: function() { return this.role === 'retailer'; }
  },
  // Profile fields
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    sparse: true
  },
  address: {
    type: String,
    maxlength: 200,
    trim: true
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(v) {
        return !v || JSON.stringify(v).length <= 500;
      },
      message: 'Preferences must be less than 500 characters when serialized'
    }
  },
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster email lookups
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing password for user:', this.email);
    console.log('Candidate password length:', candidatePassword ? candidatePassword.length : 0);
    console.log('Stored password hash exists:', !!this.password);
    
    if (!candidatePassword || !this.password) {
      console.error('Missing password data for comparison');
      return false;
    }
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('Error during password comparison:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      candidatePasswordType: typeof candidatePassword,
      storedPasswordType: typeof this.password
    });
    return false;
  }
};

// Transform output (exclude password)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);