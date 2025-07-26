const express = require('express');
const mongoose = require('mongoose');
const { body, param, query, validationResult } = require('express-validator');
const Rental = require('../models/rental.model');
const Outfit = require('../models/outfit.model');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const createRentalValidation = [
  body('outfitId')
    .isMongoId()
    .withMessage('Invalid outfit ID'),
  body('startDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('deliveryAddress')
    .optional()
    .isObject()
    .withMessage('Delivery address must be an object'),
  body('deliveryMethod')
    .optional()
    .isIn(['pickup', 'delivery'])
    .withMessage('Delivery method must be pickup or delivery'),
  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters')
];

// POST /api/rentals - Create new rental booking
router.post('/', [
  ...createRentalValidation,
  authenticateToken
], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { outfitId, startDate, endDate, deliveryAddress, deliveryMethod, specialInstructions } = req.body;
    const userId = req.user._id;

    // Check if outfit exists and is available
    const outfit = await Outfit.findById(outfitId).session(session);
    if (!outfit || !outfit.isActive) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Outfit not found' });
    }

    if (!outfit.availability) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Outfit is not available for rental' });
    }

    // Check for date conflicts
    const isAvailable = await Rental.checkAvailability(outfitId, startDate, endDate);
    if (!isAvailable) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Outfit is not available for the selected dates' 
      });
    }

    // Calculate rental duration and total amount
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAmount = outfit.rentalPrice * durationDays;
    const securityDeposit = Math.round(outfit.rentalPrice * 0.5); // 50% of daily rate

    // Create rental
    const rental = new Rental({
      userId,
      outfitId,
      startDate,
      endDate,
      totalAmount,
      securityDeposit,
      deliveryAddress,
      deliveryMethod: deliveryMethod || 'delivery',
      specialInstructions
    });

    await rental.save({ session });

    // Update outfit availability (temporarily mark as unavailable)
    await Outfit.findByIdAndUpdate(
      outfitId,
      { availability: false },
      { session }
    );

    await session.commitTransaction();

    // Populate outfit details for response
    await rental.populate('outfitId', 'title imageUrl rentalPrice');

    res.status(201).json({
      message: 'Rental booking created successfully',
      rental
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create rental error:', error);
    
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
  } finally {
    session.endSession();
  }
});

// GET /api/rentals/:id - Get rental details
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid rental ID'),
  authenticateToken
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

    const rental = await Rental.findById(id)
      .populate('userId', 'name email')
      .populate('outfitId', 'title description imageUrl rentalPrice size type category');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if user owns this rental or is admin
    if (rental.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Rental retrieved successfully',
      rental
    });

  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/rentals/user/:userId - List all rentals for a user
router.get('/user/:userId', [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
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

    const { userId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [rentals, total] = await Promise.all([
      Rental.find(filter)
        .populate('outfitId', 'title imageUrl rentalPrice size type category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Rental.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: 'Rentals retrieved successfully',
      rentals,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// PATCH /api/rentals/:id/status - Update rental status (admin or user)
router.patch('/:id/status', [
  param('id').isMongoId().withMessage('Invalid rental ID'),
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
  authenticateToken
], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const rental = await Rental.findById(id).populate('outfitId').session(session);
    if (!rental) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check permissions
    const isOwner = rental.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Users can only cancel their own rentals
    if (isOwner && !isAdmin && status !== 'cancelled') {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Users can only cancel their rentals' });
    }

    // Update rental status
    rental.status = status;
    if (reason) rental.specialInstructions = reason;

    // Handle outfit availability based on status
    if (status === 'cancelled' || status === 'completed') {
      // Make outfit available again
      await Outfit.findByIdAndUpdate(
        rental.outfitId._id,
        { availability: true },
        { session }
      );
    } else if (status === 'confirmed') {
      // Increment total rentals count
      await Outfit.findByIdAndUpdate(
        rental.outfitId._id,
        { $inc: { totalRentals: 1 } },
        { session }
      );
    }

    await rental.save({ session });
    await session.commitTransaction();

    res.json({
      message: 'Rental status updated successfully',
      rental
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Update rental status error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  } finally {
    session.endSession();
  }
});

// POST /api/rentals/:id/review - Add review and rating
router.post('/:id/review', [
  param('id').isMongoId().withMessage('Invalid rental ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 1000 }).withMessage('Review must be less than 1000 characters'),
  authenticateToken
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
    const { rating, review } = req.body;

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if user owns this rental
    if (rental.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if rental is completed
    if (rental.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed rentals' });
    }

    // Check if already reviewed
    if (rental.userRating) {
      return res.status(400).json({ message: 'Rental already reviewed' });
    }

    // Update rental with review
    rental.userRating = rating;
    rental.userReview = review;
    await rental.save();

    // Update outfit rating
    const Outfit = require('../models/outfit.model');
    const outfit = await Outfit.findById(rental.outfitId);
    if (outfit) {
      const newCount = outfit.rating.count + 1;
      const newAverage = ((outfit.rating.average * outfit.rating.count) + rating) / newCount;
      
      outfit.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
      outfit.rating.count = newCount;
      await outfit.save();
    }

    res.json({
      message: 'Review added successfully',
      rental
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;