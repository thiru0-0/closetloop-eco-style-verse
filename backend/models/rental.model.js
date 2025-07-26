const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  // Delivery information
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'delivery'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'returned'],
    default: 'pending'
  },
  // Tracking
  trackingNumber: String,
  deliveredAt: Date,
  returnedAt: Date,
  // Notes and feedback
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  userReview: {
    type: String,
    maxlength: 1000
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
rentalSchema.index({ userId: 1, createdAt: -1 });
rentalSchema.index({ outfitId: 1, startDate: 1, endDate: 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });

// Update updatedAt on save
rentalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate rental duration in days
rentalSchema.virtual('durationDays').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Check for date conflicts
rentalSchema.statics.checkAvailability = async function(outfitId, startDate, endDate, excludeRentalId = null) {
  const query = {
    outfitId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };
  
  if (excludeRentalId) {
    query._id = { $ne: excludeRentalId };
  }
  
  const conflictingRental = await this.findOne(query);
  return !conflictingRental;
};

module.exports = mongoose.model('Rental', rentalSchema);