const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendgridMail = require('@sendgrid/mail');
console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY);
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password , email } = req.body;
  try {
    const user = new User({ username, password , email});
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    console.log(`this is password user.password ${user.password}`);
    console.log(`this is password ${password}`);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey', { expiresIn: '1h' });
    res.json({ token , userId: user._id, userRole: user.role});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 Request Password Reset Token
router.post('/forgot-password/request', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token in DB with expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Email content
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const msg = {
      to: user.email,
      from: 'daniellefreeacc01@gmail.com', // Use a verified sender
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetLink}`,
      html: `<p>Click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    // Send email
    await sendgridMail.send(msg);
    res.json({ message: 'Password reset link sent to email' });

  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//     // Send response (In real-world, send via email)
//     res.json({ message: 'Reset token generated', resetToken });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// 📌 Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Hash the new password manually
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
