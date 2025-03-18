const tourController = require('../controller/tourController');
const express = require('express');

const router = express.Router();

router
  .route('/top-5-tours')
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .update(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
