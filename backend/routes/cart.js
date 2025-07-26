const express = require('express');
const router = express.Router();
const Cart = require('../models/cart.model');
const Outfit = require('../models/outfit.model');
const { authenticateToken } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Helper function to get mock outfit data
const getMockOutfitData = (outfitId) => {
  const mockOutfits = {
    '1': {
      _id: '1',
      title: 'Summer Floral Dress',
      imageUrl: '/src/assets/outfit1.jpg',
      rentalPrice: 499,
      category: 'Party',
      size: 'S'
    },
    '2': {
      _id: '2',
      title: 'Professional Business Suit',
      imageUrl: '/src/assets/outfit2.jpg',
      rentalPrice: 899,
      category: 'Formal',
      size: 'M'
    },
    '3': {
      _id: '3',
      title: 'Casual Weekend Outfit',
      imageUrl: '/src/assets/outfit3.jpg',
      rentalPrice: 299,
      category: 'Casual',
      size: 'L'
    }
  };
  
  return mockOutfits[outfitId] || { _id: outfitId, title: 'Unknown Outfit' };
};

// Helper function to populate cart with mock outfit data
const populateCartWithOutfits = (cart) => {
  return {
    ...cart.toObject(),
    items: cart.items.map(item => {
      if (typeof item.outfitId === 'string') {
        return {
          ...item,
          outfitId: getMockOutfitData(item.outfitId)
        };
      }
      return item;
    })
  };
};

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting cart for user:', userId);

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
      console.log('Created new cart for user:', userId);
    }

    // Handle mock outfit data for cart items
    const cartWithOutfits = populateCartWithOutfits(cart);

    res.json({
      message: 'Cart retrieved successfully',
      cart: cartWithOutfits
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { outfitId, quantity = 1, rentalStartDate, rentalEndDate } = req.body;

    // Accept valid ObjectId or known mock IDs
    const isValidObjectId = mongoose.Types.ObjectId.isValid(outfitId);
    const isMockId = ['1', '2', '3'].includes(outfitId);

    if (!isValidObjectId && !isMockId) {
      return res.status(400).json({ error: 'Invalid outfit ID format' });
    }

    console.log('Add to cart request:', {
      userId,
      outfitId,
      quantity,
      rentalStartDate,
      rentalEndDate
    });

    // Validate required fields
    if (!outfitId) {
      console.log('Missing outfitId in request');
      return res.status(400).json({ error: 'Outfit ID is required' });
    }

    if (!userId) {
      console.log('Missing userId in request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // For mock data, create a mock outfit if it doesn't exist in database
    let outfit;
    try {
      outfit = await Outfit.findById(outfitId);
    } catch (error) {
      console.log('Invalid outfit ID format:', outfitId);
      return res.status(400).json({ error: 'Invalid outfit ID format' });
    }

    if (!outfit) {
      console.log('Outfit not found in database, creating mock outfit for ID:', outfitId);
      
      // Create a mock outfit for testing purposes
      const mockOutfits = {
        '1': {
          title: 'Summer Floral Dress',
          rentalPrice: 499,
          availability: true
        },
        '2': {
          title: 'Professional Business Suit',
          rentalPrice: 899,
          availability: true
        },
        '3': {
          title: 'Casual Weekend Outfit',
          rentalPrice: 299,
          availability: false
        }
      };

      const mockOutfit = mockOutfits[outfitId];
      if (!mockOutfit) {
        console.log('Mock outfit not found for ID:', outfitId);
        return res.status(404).json({ error: 'Outfit not found' });
      }

      // Create a temporary outfit object for cart
      outfit = {
        _id: outfitId,
        title: mockOutfit.title,
        rentalPrice: mockOutfit.rentalPrice,
        availability: mockOutfit.availability
      };
    }

    if (!outfit.availability) {
      console.log('Outfit not available for rental:', outfitId);
      return res.status(400).json({ error: 'Outfit is not available for rental' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.outfitId.toString() === outfitId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      console.log('Updating existing item in cart');
      cart.items[existingItemIndex].quantity += quantity;
      if (rentalStartDate) cart.items[existingItemIndex].rentalStartDate = rentalStartDate;
      if (rentalEndDate) cart.items[existingItemIndex].rentalEndDate = rentalEndDate;
    } else {
      // Add new item
      console.log('Adding new item to cart');
      cart.items.push({
        outfitId,
        quantity,
        rentalStartDate,
        rentalEndDate,
        rentalPrice: outfit.rentalPrice
      });
    }

    await cart.save();
    console.log('Cart saved successfully');

    // Handle mock outfit data for response
    const cartWithOutfits = populateCartWithOutfits(cart);

    res.json({
      message: 'Item added to cart successfully',
      cart: cartWithOutfits
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Server error during add to cart' });
  }
});

// PUT /api/cart/update/:itemId - Update cart item quantity
router.put('/update/:itemId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity, rentalStartDate, rentalEndDate } = req.body;

    console.log('Update cart item request:', {
      userId,
      itemId,
      quantity,
      rentalStartDate,
      rentalEndDate
    });

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Update item
    cart.items[itemIndex].quantity = quantity;
    if (rentalStartDate) cart.items[itemIndex].rentalStartDate = rentalStartDate;
    if (rentalEndDate) cart.items[itemIndex].rentalEndDate = rentalEndDate;

    await cart.save();

    // Handle mock outfit data for response
    const cartWithOutfits = populateCartWithOutfits(cart);

    res.json({
      message: 'Cart item updated successfully',
      cart: cartWithOutfits
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart/remove/:itemId - Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    console.log('Remove cart item request:', { userId, itemId });

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Handle mock outfit data for response
    const cartWithOutfits = populateCartWithOutfits(cart);

    res.json({
      message: 'Item removed from cart successfully',
      cart: cartWithOutfits
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Clear cart request for user:', userId);

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 