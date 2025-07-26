const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Outfit = require('../models/outfit.model');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.middleware');
const { uploadToS3, generatePresignedUrl } = require('../services/s3.service');

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
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid')
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
    .withMessage('Rental price must be a positive number')
];

// GET /api/outfits - List all outfits (public with pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['women', 'men', 'unisex']).withMessage('Invalid category'),
  query('type').optional().isIn(['dress', 'suit', 'casual', 'formal', 'party', 'traditional', 'accessories']).withMessage('Invalid type'),
  query('size').optional().isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL']).withMessage('Invalid size'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  optionalAuth
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
      page = 1,
      limit = 20,
      category,
      type,
      size,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (size) filter.size = size;
    if (minPrice || maxPrice) {
      filter.rentalPrice = {};
      if (minPrice) filter.rentalPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.rentalPrice.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [outfits, total] = await Promise.all([
      Outfit.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Outfit.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: 'Outfits retrieved successfully',
      outfits,
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
    console.error('Get outfits error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/outfits/:id - Get specific outfit
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid outfit ID'),
  optionalAuth
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

    const outfit = await Outfit.findById(id);
    if (!outfit || !outfit.isActive) {
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

// POST /api/outfits - Create new outfit (admin only)
router.post('/', [
  ...createOutfitValidation,
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

// PATCH /api/outfits/:id - Update outfit (admin only)
router.patch('/:id', [
  ...updateOutfitValidation,
  authenticateToken,
  requireAdmin
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
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.totalRentals;

    const outfit = await Outfit.findByIdAndUpdate(
      id,
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

// DELETE /api/outfits/:id - Delete outfit (admin only)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid outfit ID'),
  authenticateToken,
  requireAdmin
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

    // Soft delete by setting isActive to false
    const outfit = await Outfit.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({
      message: 'Outfit deleted successfully',
      outfit
    });

  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/outfits/upload-image - Get presigned URL for image upload
router.post('/upload-image', [
  authenticateToken,
  requireAdmin,
  body('fileName').notEmpty().withMessage('File name is required'),
  body('fileType').notEmpty().withMessage('File type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fileName, fileType } = req.body;

    // Generate presigned URL for S3 upload
    const presignedUrl = await generatePresignedUrl(fileName, fileType);

    res.json({
      message: 'Presigned URL generated successfully',
      uploadUrl: presignedUrl,
      imageUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    });

  } catch (error) {
    console.error('Generate presigned URL error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;