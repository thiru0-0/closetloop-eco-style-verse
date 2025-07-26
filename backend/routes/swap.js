const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Swap = require('../models/swap.model');
const Outfit = require('../models/outfit.model');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const createSwapValidation = [
  body('responderId')
    .isMongoId()
    .withMessage('Invalid responder ID'),
  body('requestorOutfitId')
    .isMongoId()
    .withMessage('Invalid requestor outfit ID'),
  body('responderOutfitId')
    .isMongoId()
    .withMessage('Invalid responder outfit ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  body('proposedDuration')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Proposed duration must be between 1 and 30 days'),
  body('exchangeMethod')
    .optional()
    .isIn(['meetup', 'shipping', 'pickup'])
    .withMessage('Exchange method must be meetup, shipping, or pickup')
];

const updateSwapValidation = [
  param('id').isMongoId().withMessage('Invalid swap ID'),
  body('status')
    .isIn(['accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Status must be accepted, rejected, completed, or cancelled'),
  body('responseMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response message must be less than 500 characters')
];

// POST /api/swaps - Create new swap request
router.post('/', [
  ...createSwapValidation,
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

    const {
      responderId,
      requestorOutfitId,
      responderOutfitId,
      message,
      proposedDuration,
      exchangeMethod
    } = req.body;
    const requestorId = req.user._id;

    // Validate that requestor is not trying to swap with themselves
    if (requestorId.toString() === responderId) {
      return res.status(400).json({ message: 'Cannot create swap request with yourself' });
    }

    // Verify outfits exist and belong to respective users
    const [requestorOutfit, responderOutfit] = await Promise.all([
      Outfit.findById(requestorOutfitId),
      Outfit.findById(responderOutfitId)
    ]);

    if (!requestorOutfit || !requestorOutfit.isActive) {
      return res.status(404).json({ message: 'Requestor outfit not found' });
    }

    if (!responderOutfit || !responderOutfit.isActive) {
      return res.status(404).json({ message: 'Responder outfit not found' });
    }

    // Check if requestor owns the requestor outfit (in a real app, you'd have outfit ownership)
    // For now, we'll skip this check as outfits don't have userId field in the current schema

    // Create swap request
    const swap = new Swap({
      requestorId,
      responderId,
      requestorOutfitId,
      responderOutfitId,
      message,
      proposedDuration: proposedDuration || 7,
      exchangeMethod: exchangeMethod || 'meetup'
    });

    await swap.save();

    // Populate outfit details for response
    await swap.populate([
      { path: 'requestorId', select: 'name email' },
      { path: 'responderId', select: 'name email' },
      { path: 'requestorOutfitId', select: 'title imageUrl size type' },
      { path: 'responderOutfitId', select: 'title imageUrl size type' }
    ]);

    res.status(201).json({
      message: 'Swap request created successfully',
      swap
    });

  } catch (error) {
    console.error('Create swap error:', error);
    
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

// GET /api/swaps/:id - Get swap request details
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid swap ID'),
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

    const swap = await Swap.findById(id)
      .populate('requestorId', 'name email')
      .populate('responderId', 'name email')
      .populate('requestorOutfitId', 'title description imageUrl size type category')
      .populate('responderOutfitId', 'title description imageUrl size type category');

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is involved in this swap or is admin
    const isInvolved = swap.requestorId._id.toString() === req.user._id.toString() ||
                      swap.responderId._id.toString() === req.user._id.toString();
    
    if (!isInvolved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Swap request retrieved successfully',
      swap
    });

  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// PATCH /api/swaps/:id - Update swap status
router.patch('/:id', [
  ...updateSwapValidation,
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
    const { status, responseMessage } = req.body;

    const swap = await Swap.findById(id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check permissions
    const isRequestor = swap.requestorId.toString() === req.user._id.toString();
    const isResponder = swap.responderId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRequestor && !isResponder && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only responder can accept/reject, requestor can cancel
    if (status === 'accepted' || status === 'rejected') {
      if (!isResponder && !isAdmin) {
        return res.status(403).json({ message: 'Only the responder can accept or reject swap requests' });
      }
    } else if (status === 'cancelled') {
      if (!isRequestor && !isAdmin) {
        return res.status(403).json({ message: 'Only the requestor can cancel swap requests' });
      }
    } else if (status === 'completed') {
      if (!isAdmin && swap.status !== 'accepted') {
        return res.status(400).json({ message: 'Can only complete accepted swap requests' });
      }
    }

    // Check current status
    if (swap.status !== 'pending' && status !== 'completed') {
      return res.status(400).json({ message: 'Can only update pending swap requests' });
    }

    // Update swap
    swap.status = status;
    if (responseMessage) swap.responseMessage = responseMessage;

    await swap.save();

    // Populate for response
    await swap.populate([
      { path: 'requestorId', select: 'name email' },
      { path: 'responderId', select: 'name email' },
      { path: 'requestorOutfitId', select: 'title imageUrl size type' },
      { path: 'responderOutfitId', select: 'title imageUrl size type' }
    ]);

    res.json({
      message: 'Swap request updated successfully',
      swap
    });

  } catch (error) {
    console.error('Update swap error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/swaps/user/:userId - List all swap requests for a user
router.get('/user/:userId', [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isIn(['sent', 'received']).withMessage('Type must be sent or received'),
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
    const { page = 1, limit = 20, status, type } = req.query;

    // Build filter
    let filter = {};
    
    if (type === 'sent') {
      filter.requestorId = userId;
    } else if (type === 'received') {
      filter.responderId = userId;
    } else {
      filter.$or = [
        { requestorId: userId },
        { responderId: userId }
      ];
    }

    if (status) filter.status = status;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [swaps, total] = await Promise.all([
      Swap.find(filter)
        .populate('requestorId', 'name email')
        .populate('responderId', 'name email')
        .populate('requestorOutfitId', 'title imageUrl size type')
        .populate('responderOutfitId', 'title imageUrl size type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Swap.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: 'Swap requests retrieved successfully',
      swaps,
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
    console.error('Get user swaps error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/swaps/:id/feedback - Add feedback and rating after swap completion
router.post('/:id/feedback', [
  param('id').isMongoId().withMessage('Invalid swap ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 500 }).withMessage('Feedback must be less than 500 characters'),
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
    const { rating, feedback } = req.body;

    const swap = await Swap.findById(id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is involved in this swap
    const isRequestor = swap.requestorId.toString() === req.user._id.toString();
    const isResponder = swap.responderId.toString() === req.user._id.toString();

    if (!isRequestor && !isResponder) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if swap is completed
    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed swaps' });
    }

    // Update appropriate feedback fields
    if (isRequestor) {
      if (swap.requestorRating) {
        return res.status(400).json({ message: 'Feedback already provided' });
      }
      swap.requestorRating = rating;
      swap.requestorFeedback = feedback;
    } else {
      if (swap.responderRating) {
        return res.status(400).json({ message: 'Feedback already provided' });
      }
      swap.responderRating = rating;
      swap.responderFeedback = feedback;
    }

    await swap.save();

    res.json({
      message: 'Feedback added successfully',
      swap
    });

  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;