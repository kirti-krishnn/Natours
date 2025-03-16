const mongoose = require('mongoose');

const tourModel = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A tour cannot be without a name'],
      maxLength: [40, 'Tour name cannot be more than 40'],
      minLength: [10, 'Tour name cannot be less than 10'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour has a certain duration'],
      trim: true,
      validate: {
        validator: (val) => {
          return val < 30;
        },
        message: `duration should be less than 30 days. Given ${props.value}`,
      },
    },
    maxGroupSize: {
      type: Number,
      trim: true,
      required: [true, 'The group size should be mentioned'],
    },
    difficulty: {
      type: String,
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'the difficulty should be :easy, medium or difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      required: [true, 'A tour has a rating'],
      min: [1, 'the rating cannot be less than 1'],
      max: [5, ' the rating cannot be more than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour cannot be without a price'],
      validate: {
        validator: function (val) {
          return val < 0;
        },
        message: 'Price cannot be negative.',
      },
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `The discounted price value should be less than the tour price ${this.price}`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'the tour should have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'the tour should have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'the tour should have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourModel.virtual('durationWeek').get(function () {
  return duration / 7;
});

tourModel.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourModel.pre('/^find/', async function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourModel.post('/^find/', async function (docs, next) {
  console.log(`The Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

tourModel.pre('aggregate', function (next) {
  this.pipeline().unshift({ secretTour: { ne: true } });
  next();
});

const Tour = mongoose.model('Tour', tourModel);
module.exports = Tour;
