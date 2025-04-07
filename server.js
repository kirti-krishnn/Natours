const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, './config.env') });
const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('✅ Connected to DB'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});
