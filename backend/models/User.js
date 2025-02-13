const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  deletedAt: {type: Date, default: null},
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log('hasing password:', this.password);
  this.password = await bcrypt.hash(this.password, 10);
  console.log('hashed password:', this.password);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);  // Ensure bcrypt.compare() is used
};


module.exports = mongoose.model('User', userSchema);