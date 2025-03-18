const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(
    'mongodb+srv://kirtikrishnn:kirtik245@cluster0.7v9bcb2.mongodb.net/Natours?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => console.log('✅ Connected to DB'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

app.listen(3000, () => {
  console.log('Server listening at port 3000');
});
