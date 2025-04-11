const Tour = require('../model/tourModel');
const globalErrorHandler = require('./errorController.js');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .limit()
    .sort()
    .paginate();

  console.log('🔍 Received Query Params:', req.query);
  console.log('✅ Mongoose Query Object:', features.query.toString());

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const id = req.params.id;
  const tour = await Tour.findById(id);

  if (!tour) {
    next(new AppError('the tour does not exist', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const tour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    next(new AppError('the tour does not exist', 404));
  }

  res.status(200).json({
    message: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    next(new AppError('the tour does not exist', 404));
  }
  res.status(200).json({
    message: 'success',
    data: {
      tour,
    },
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyStats = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const MonthlyStats = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numStartTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      MonthlyStats,
    },
  });
});
