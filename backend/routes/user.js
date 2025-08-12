const express = require('express');
const User = require('../models/User');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by ID (admin or self)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Trả về avatar cho candidate, các trường công ty cho employer
    let extra = {};
    if (user.role === 'candidate') extra.avatar = user.avatar;
    if (user.role === 'employer') {
      extra.companyLogo = user.companyLogo;
      extra.companyName = user.companyName;
      extra.companyAddress = user.companyAddress;
      extra.companyWebsite = user.companyWebsite;
      extra.companyDescription = user.companyDescription;
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      ...extra
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user (admin or self)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    Object.assign(user, req.body);
    await user.save();
    // Trả về avatar cho candidate, các trường công ty cho employer
    let extra = {};
    if (user.role === 'candidate') extra.avatar = user.avatar;
    if (user.role === 'employer') {
      extra.companyLogo = user.companyLogo;
      extra.companyName = user.companyName;
      extra.companyAddress = user.companyAddress;
      extra.companyWebsite = user.companyWebsite;
      extra.companyDescription = user.companyDescription;
    }
    res.json({
      message: 'User updated',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        ...extra
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
