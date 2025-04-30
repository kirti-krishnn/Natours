const express = require('express');
const authController = require('../controller/authController');
//const tourController = require('../controller/tourController');
const router = express.Router();

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgotPassword').get(authController.forgotPassword);
router
  .route('/resetPassword')
  .get(authController.protect, authController.resetPassword);

//router.route('/').get

module.exports = router;
