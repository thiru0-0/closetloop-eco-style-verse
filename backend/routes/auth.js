const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'user', storeName, gstNumber, businessLicense, storeAddress, pincode, storeCategory } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Validate role
  if (role && !['user', 'retailer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "user" or "retailer"' });
  }

  // Validate retailer-specific fields
  if (role === 'retailer') {
    if (!storeName || !gstNumber || !storeAddress || !pincode || !storeCategory) {
      return res.status(400).json({ error: 'All retailer fields are required: storeName, gstNumber, storeAddress, pincode, storeCategory' });
    }
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Don't hash password here - the model pre-save hook will handle it
    const userData = {
      name,
      email,
      password, // Send plain password, model will hash it
      role
    };

    // Add retailer-specific fields if role is retailer
    if (role === 'retailer') {
      Object.assign(userData, {
        storeName,
        gstNumber,
        businessLicense: businessLicense || '', // Make it optional
        storeAddress,
        pincode,
        storeCategory
      });
    }

    const newUser = new User(userData);
    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '1d',
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        ...(role === 'retailer' && {
          storeName: newUser.storeName,
          storeCategory: newUser.storeCategory
        })
      }
    });
  } catch (err) {
    console.error('Signup Error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      errors: err.errors
    });
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'retailer' && {
          storeName: user.storeName,
          storeCategory: user.storeCategory
        })
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;