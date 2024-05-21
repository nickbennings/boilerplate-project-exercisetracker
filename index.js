const express = require('express');
const app = express();
const assert = require('assert');
const mongoose = require('mongoose'); // Add this line

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Exercise and User models
const Exercise = mongoose.model('Exercise', {
  username: String,
  description: String,
  duration: Number,
  date: Date
});

const User = mongoose.model('User', {
  username: String
});

// Continue with your existing code
// Create a new user
app.post('/api/users', async (req, res) => {
  // Your existing code
});

// Add an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  // Your existing code
});

// Retrieve exercise logs for a user
app.get('/api/users/:_id/logs', async (req, res) => {
  // Your existing code
});

module.exports = app;
