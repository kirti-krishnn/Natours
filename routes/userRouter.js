const express = require('express');
const authController = require('../controller/authController');
//const tourController = require('../controller/tourController');
const router = express.Router();

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);

router
  .route('/resetPassword/:token')
  .patch(authController.protect, authController.forgotPassword);

router
  .route('/changePassword')
  .patch(authController.protect, authController.resetPassword);

//router.route('/').get

module.exports = router;
