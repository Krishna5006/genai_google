// routes/user.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp -otpExpires');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 3: Select role (buyer or seller)
router.post('/select-role', auth, [
  body('role').isIn(['buyer', 'seller']).withMessage('Role must be either buyer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const user = req.user;

    if (!user.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone not verified' });
    }

    user.role = role;
    user.registrationStep = 3;
    await user.save();

    res.json({
      message: 'Role selected successfully',
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        registrationStep: user.registrationStep
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 4: Upload profile picture
router.post('/upload-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = req.user;

    if (!user.isPhoneVerified || !user.role) {
      return res.status(400).json({ message: 'Complete previous steps first' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a profile picture' });
    }

    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    user.registrationStep = 4;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        registrationStep: user.registrationStep
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 5: Add name
router.post('/add-name', auth, [
  body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const user = req.user;

    if (!user.isPhoneVerified || !user.role) {
      return res.status(400).json({ message: 'Complete previous steps first' });
    }

    user.name = name;
    user.registrationStep = 5;
    await user.save();

    res.json({
      message: 'Name added successfully',
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        registrationStep: user.registrationStep
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 6: Add description
router.post('/add-description', auth, [
  body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description } = req.body;
    const user = req.user;

    if (!user.isPhoneVerified || !user.role || !user.name) {
      return res.status(400).json({ message: 'Complete previous steps first' });
    }

    user.description = description;
    user.registrationStep = 6;
    user.checkProfileCompletion();
    await user.save();

    res.json({
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        description: user.description,
        profilePicture: user.profilePicture,
        registrationStep: user.registrationStep,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;