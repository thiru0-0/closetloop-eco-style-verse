const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/user.model');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number (e.g., +1234567890)'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('preferences')
    .optional()
    .custom((value) => {
      if (typeof value === 'object' && JSON.stringify(value).length > 500) {
        throw new Error('Preferences must be less than 500 characters when serialized');
      }
      return true;
    })
];

// GET /api/users/:id - Get user profile
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  authenticateToken,
  requireOwnershipOrAdmin()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// PATCH /api/users/:id - Update user profile
router.patch('/:id', [
  ...updateProfileValidation,
  authenticateToken,
  requireOwnershipOrAdmin()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.isActive;
    delete updates.createdAt;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
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

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  authenticateToken,
  requireOwnershipOrAdmin()
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

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics (you'll need to import these models)
    const Rental = require('../models/rental.model');
    const Swap = require('../models/swap.model');
    const Order = require('../models/order.model');

    const [
      totalRentals,
      activeRentals,
      completedRentals,
      totalSwaps,
      successfulSwaps,
      totalOrders,
      totalSpent
    ] = await Promise.all([
      Rental.countDocuments({ userId: id }),
      Rental.countDocuments({ userId: id, status: 'active' }),
      Rental.countDocuments({ userId: id, status: 'completed' }),
      Swap.countDocuments({ 
        $or: [{ requestorId: id }, { responderId: id }] 
      }),
      Swap.countDocuments({ 
        $or: [{ requestorId: id }, { responderId: id }],
        status: 'completed'
      }),
      Order.countDocuments({ userId: id }),
      Order.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(id), paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    // Calculate eco impact (approximate)
    const ecoImpact = {
      co2Saved: completedRentals * 3.5, // kg
      waterSaved: completedRentals * 1500, // liters
      wasteReduced: completedRentals * 0.8 // kg
    };

    res.json({
      message: 'User statistics retrieved successfully',
      stats: {
        rentals: {
          total: totalRentals,
          active: activeRentals,
          completed: completedRentals
        },
        swaps: {
          total: totalSwaps,
          successful: successfulSwaps,
          successRate: totalSwaps > 0 ? (successfulSwaps / totalSwaps * 100).toFixed(1) : 0
        },
        orders: {
          total: totalOrders,
          totalSpent
        },
        ecoImpact,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;