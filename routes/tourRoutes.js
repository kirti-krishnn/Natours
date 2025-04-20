const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const router = express.Router();

router
  .route('/top-5-tours')
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

router.route('/getMonthlyStats/:year').get(tourController.getMonthlyStats);

router.route('/getStats').get(tourController.getStats);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

//authController.protect,

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
