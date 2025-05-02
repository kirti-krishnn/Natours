const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const { decode } = require('punycode');
const sendEmail = require('../utils/email');

const signToken = function (val) {
  return jwt.sign({ val }, process.env.JWT_SECRET_CODE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (user, statusCode, res) {
  const token = signToken(user.id);
  res.send(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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
  createSendToken(user, 200, res);
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

  createSendToken(user, 200, res);
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
  /* console.log(user);
  console.log(typeof user.changedPasswordAfter); // should be "function" */

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
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('The user does not exists. Enter a valid email id', 401)
    );
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const msg = `Forgot Password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\n If you did not forget the password then please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: `password reset token (valid for 10 mins)`,
      message,
    });

    createSendToken(user, 200, res);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email. Try again', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetToken: { $gt: Date.now() },
  });

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});
