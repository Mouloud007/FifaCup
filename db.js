// Import mongoose
const mongoose = require('mongoose');

// Define the connection string
const uri = 'mongodb://127.0.0.1:27017/fooot';

// Connect to the database
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));
