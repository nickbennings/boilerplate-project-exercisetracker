// index.js

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB setup
mongoose.connect('mongodb://localhost/exerciseTracker', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Exercise and User models

// Routes for handling exercises and users

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
