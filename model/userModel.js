const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user cannot be without a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user should have an email'],
    validate: [validator.isEmail, 'The entered Email ID is invalid'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is needed. Please enter.'],
    minlength: 8,
    maxlength: 20,
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please rewrite the password in the PasswordConfirm field.',
    ],
    trim: true,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const User = mongoose.Model('User', userSchema);
module.exports = User;
