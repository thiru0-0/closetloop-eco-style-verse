const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  outfitId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for mock data
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  rentalStartDate: {
    type: Date
  },
  rentalEndDate: {
    type: Date
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.rentalPrice * item.quantity);
  }, 0);
  this.updatedAt = new Date();
  next();
});

// Index for faster lookups
cartSchema.index({ userId: 1 });

// Virtual for cart count
cartSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Method to check if cart is empty
cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// Method to get cart summary
cartSchema.methods.getSummary = function() {
  return {
    itemCount: this.items.length,
    totalAmount: this.totalAmount,
    isEmpty: this.isEmpty()
  };
};

module.exports = mongoose.model('Cart', cartSchema); 