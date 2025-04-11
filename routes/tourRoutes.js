const express = require('express');
const tourController = require('../controller/tourController');
const router = express.Router();

router
  .route('/top-5-tours')
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

router.route('/getMonthlyStats/:year').get(tourController.getMonthlyStats);

router.route('/getStats').get(tourController.getStats);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
