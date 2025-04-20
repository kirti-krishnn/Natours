const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgotPassword').get(tourController.forgotPassword);
router.route('/resetPassword').get(tourController.resetPassword);

//router.route('/').get

module.exports = router;
