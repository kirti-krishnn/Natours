const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'the password does not match.',
    },
  },
  roles: {
    type: String,
    enum: {
      values: ['admin', 'lead-guide', 'guide', 'user'],
      message: 'the user needs to have a role',
    },
    default: 'user',
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.passwordCompare = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (tokenIssuedTime) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log('kirti');

    return changedTimestamp > tokenIssuedTime;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString(hex);
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
