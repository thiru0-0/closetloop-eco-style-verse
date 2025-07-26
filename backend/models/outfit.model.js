const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  type: {
    type: String,
    required: true,
    enum: ['dress', 'suit', 'casual', 'formal', 'party', 'traditional', 'accessories']
  },
  category: {
    type: String,
    required: true,
    enum: ['women', 'men', 'unisex']
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please enter a valid image URL'
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  rentalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  brand: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  availability: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Sustainability metrics
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  ecoImpact: {
    co2Saved: { type: Number, default: 3.5 }, // kg
    waterSaved: { type: Number, default: 1500 }, // liters
    wasteReduced: { type: Number, default: 0.8 } // kg
  },
  // Metadata
  totalRentals: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes for performance
outfitSchema.index({ category: 1, type: 1 });
outfitSchema.index({ tags: 1 });
outfitSchema.index({ availability: 1, isActive: 1 });
outfitSchema.index({ size: 1 });
outfitSchema.index({ rentalPrice: 1 });
outfitSchema.index({ 'rating.average': -1 });
outfitSchema.index({ totalRentals: -1 });

// Update updatedAt on save
outfitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Text search index
outfitSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  brand: 'text'
});

module.exports = mongoose.model('Outfit', outfitSchema);