const express = require('express');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Get user (self or admin)
router.get('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});


// Update user (self or admin)
router.put('/:id', protect, async (req, res) => {
  console.log('role of user', req.user.role);
  
  // Ensure the user is either an admin or updating their own information
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
  }
  
  try {
      // Check if password is being updated
      if (req.body.password) {
          // Hash the password before updating
          req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      // Update the user and return the updated data
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // If user is not found
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Send the updated user object in response
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});


//Get all users (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete user (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Users can only delete their own profile, admins can delete any profile
    if (req.user.role !== 'admin' && req.user.id !== String(user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark the user for deletion with a 'deletedAt' timestamp (temporary deletion)
    user.deletedAt = Date.now();
    await user.save();

    // Set a delay of 1 minute (60000 ms) before permanent deletion
    setTimeout(async () => {
      // Check if the user was marked for deletion
      const deletedUser = await User.findById(req.params.id);
      if (deletedUser && deletedUser.deletedAt) {
        await User.findByIdAndDelete(req.params.id);
        console.log('User permanently deleted after 1 minute');
      }
    }, 60000); // 1 minute delay

    res.json({ message: 'User marked for deletion. It will be permanently deleted after 1 minute.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
