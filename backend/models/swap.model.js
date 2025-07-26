const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requestorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestorOutfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true
  },
  responderOutfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500,
    trim: true
  },
  responseMessage: {
    type: String,
    maxlength: 500,
    trim: true
  },
  // Swap details
  proposedDuration: {
    type: Number, // days
    min: 1,
    max: 30,
    default: 7
  },
  swapStartDate: {
    type: Date
  },
  swapEndDate: {
    type: Date
  },
  // Delivery/Exchange method
  exchangeMethod: {
    type: String,
    enum: ['meetup', 'shipping', 'pickup'],
    default: 'meetup'
  },
  meetupLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Tracking
  requestorShipped: {
    type: Boolean,
    default: false
  },
  responderShipped: {
    type: Boolean,
    default: false
  },
  requestorReceived: {
    type: Boolean,
    default: false
  },
  responderReceived: {
    type: Boolean,
    default: false
  },
  // Ratings and feedback
  requestorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  responderRating: {
    type: Number,
    min: 1,
    max: 5
  },
  requestorFeedback: {
    type: String,
    maxlength: 500
  },
  responderFeedback: {
    type: String,
    maxlength: 500
  },
  // Timestamps
  acceptedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
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
swapSchema.index({ requestorId: 1, createdAt: -1 });
swapSchema.index({ responderId: 1, createdAt: -1 });
swapSchema.index({ status: 1 });
swapSchema.index({ requestorOutfitId: 1 });
swapSchema.index({ responderOutfitId: 1 });

// Update updatedAt on save
swapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that users don't swap with themselves
swapSchema.pre('save', function(next) {
  if (this.requestorId.equals(this.responderId)) {
    next(new Error('Cannot create swap request with yourself'));
  } else {
    next();
  }
});

// Update status timestamps
swapSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'accepted':
        if (!this.acceptedAt) this.acceptedAt = now;
        break;
      case 'rejected':
        if (!this.rejectedAt) this.rejectedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Swap', swapSchema);