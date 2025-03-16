class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedField = ['page', 'limit', 'sort', 'fields'];
    const queryObj = { ...this.query };

    excludedField.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortStr = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
      return this;
    } else {
      this.query = this.query.sort('-createdAt');
    }
  }
}
