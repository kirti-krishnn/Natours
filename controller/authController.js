const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const { decode } = require('punycode');

const signToken = function (val) {
  return jwt.sign({ val }, process.env.JWT_SECRET_CODE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError('please provide email and password both', 404));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('the email doesnt exists', 404));
  }
  console.log(user.password);

  const isMatch = await user.passwordCompare(password, user.password);

  if (!isMatch) {
    return next(new AppError('password doesnt match', 404));
  }

  const token = signToken(user.id);

  res.status(200).json({
    token,
    data: {
      status: 'success',
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  const decoded = await promisify(jwt.verify)(token, 'ilovemyself');
  console.log('decoded: ', decoded);

  const user = await User.findById(decoded.val);

  if (!user) {
    return next(new AppError('The user no longer exists'));
  }
  console.log(user);
  console.log(typeof user.changedPasswordAfter); // should be "function"

  if (user.changedPasswordAfter(decode.iat))
    return next(new AppError('The password has changed .Login again!'), 401);

  req.user = user;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(
        new AppError(
          'The user doesnot have the permission to perform admin operations',
          401
        )
      );
    }
    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne(req.body.email);
  if (!user) {
    return next(
      new AppError('The user does not exists. Enter a valid email id', 401)
    );
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
