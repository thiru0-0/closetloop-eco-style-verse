const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Outfit = require('../models/outfit.model');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const createOutfitValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('size')
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
    .withMessage('Size must be one of: XS, S, M, L, XL, XXL'),
  body('type')
    .isIn(['dress', 'suit', 'casual', 'formal', 'party', 'traditional', 'accessories'])
    .withMessage('Type must be one of: dress, suit, casual, formal, party, traditional, accessories'),
  body('category')
    .isIn(['women', 'men', 'unisex'])
    .withMessage('Category must be one of: women, men, unisex'),
  body('rentalPrice')
    .isFloat({ min: 0 })
    .withMessage('Rental price must be a positive number'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateOutfitValidation = [
  param('id').isMongoId().withMessage('Invalid outfit ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('size')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
    .withMessage('Size must be one of: XS, S, M, L, XL, XXL'),
  body('type')
    .optional()
    .isIn(['dress', 'suit', 'casual', 'formal', 'party', 'traditional', 'accessories'])
    .withMessage('Type must be one of: dress, suit, casual, formal, party, traditional, accessories'),
  body('category')
    .optional()
    .isIn(['women', 'men', 'unisex'])
    .withMessage('Category must be one of: women, men, unisex'),
  body('rentalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rental price must be a positive number'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('availability')
    .optional()
    .isBoolean()
    .withMessage('Availability must be a boolean'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// GET /api/store/outfits - Get retailer's outfits
router.get('/outfits', authenticateToken, requireRole('retailer'), async (req, res) => {
  try {
    const retailerId = req.user._id;
    
    const outfits = await Outfit.find({ createdBy: retailerId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: 'Outfits retrieved successfully',
      outfits
    });

  } catch (error) {
    console.error('Get retailer outfits error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/store/outfits - Create new outfit (retailer only)
router.post('/outfits', [
  ...createOutfitValidation,
  authenticateToken,
  requireRole('retailer')
], async (req, res) => {
  try {
    // Debug: Log the request body
    console.log('Received outfit data:', req.body);
    console.log('User ID:', req.user._id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const outfitData = {
      ...req.body,
      createdBy: req.user._id
    };

    const outfit = new Outfit(outfitData);
    await outfit.save();

    res.status(201).json({
      message: 'Outfit created successfully',
      outfit
    });

  } catch (error) {
    console.error('Create outfit error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/store/outfits/:id - Get specific outfit (retailer only)
router.get('/outfits/:id', [
  param('id').isMongoId().withMessage('Invalid outfit ID'),
  authenticateToken,
  requireRole('retailer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const retailerId = req.user._id;

    const outfit = await Outfit.findOne({ _id: id, createdBy: retailerId });
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({
      message: 'Outfit retrieved successfully',
      outfit
    });

  } catch (error) {
    console.error('Get outfit error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// PATCH /api/store/outfits/:id - Update outfit (retailer only)
router.patch('/outfits/:id', [
  ...updateOutfitValidation,
  authenticateToken,
  requireRole('retailer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const retailerId = req.user._id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.totalRentals;

    const outfit = await Outfit.findOneAndUpdate(
      { _id: id, createdBy: retailerId },
      { ...updates, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({
      message: 'Outfit updated successfully',
      outfit
    });

  } catch (error) {
    console.error('Update outfit error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// DELETE /api/store/outfits/:id - Delete outfit (retailer only)
router.delete('/outfits/:id', [
  param('id').isMongoId().withMessage('Invalid outfit ID'),
  authenticateToken,
  requireRole('retailer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const retailerId = req.user._id;

    const outfit = await Outfit.findOneAndDelete({ _id: id, createdBy: retailerId });
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({
      message: 'Outfit deleted successfully'
    });

  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/store/stats - Get retailer store statistics
router.get('/stats', authenticateToken, requireRole('retailer'), async (req, res) => {
  try {
    const retailerId = req.user._id;
    
    const [
      totalOutfits,
      activeOutfits,
      totalRentals,
      totalRevenue
    ] = await Promise.all([
      Outfit.countDocuments({ createdBy: retailerId }),
      Outfit.countDocuments({ createdBy: retailerId, isActive: true, availability: true }),
      // Note: These would need to be calculated from rental/order data
      // For now, returning 0 as placeholders
      Promise.resolve(0),
      Promise.resolve(0)
    ]);

    const averagePrice = await Outfit.aggregate([
      { $match: { createdBy: retailerId } },
      { $group: { _id: null, avgPrice: { $avg: '$rentalPrice' } } }
    ]);

    res.json({
      message: 'Store statistics retrieved successfully',
      stats: {
        totalOutfits,
        activeOutfits,
        totalRentals,
        totalRevenue,
        averagePrice: averagePrice.length > 0 ? Math.round(averagePrice[0].avgPrice) : 0
      }
    });

  } catch (error) {
    console.error('Get store stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router; 