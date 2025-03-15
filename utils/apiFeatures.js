class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedField = ['page', 'limit', 'sort', 'fields'];
    const queryObj = { ...this.query };

    const query = excludedField.forEach((el) => delete queryObject[el]);
  }
}
