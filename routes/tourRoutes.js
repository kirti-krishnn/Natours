const express = require('express');
const tourController = require('../controller/tourController');
const router = express.Router();

router
  .route('/top-5-tours')
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

console.log('k1 router');

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
