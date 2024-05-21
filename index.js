// index.js

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB setup
mongoose.connect('mongodb://localhost/exerciseTracker');

// Exercise model
const Exercise = mongoose.model('Exercise', {
  username: String,
  description: String,
  duration: Number,
  date: Date
});

// User model
const User = mongoose.model('User', {
  username: String
});

// Routes for handling exercises and users

// Route to add a new exercise
app.post('/api/exercise/add', (req, res) => {
  const { username, description, duration, date } = req.body;

  const newExercise = new Exercise({
    username,
    description,
    duration,
    date: date ? new Date(date) : new Date()
  });

  newExercise.save((err, exercise) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(exercise);
    }
  });
});

// Route to get exercise log
app.get('/api/exercise/log', (req, res) => {
  const { username } = req.query;

  Exercise.find({ username }, (err, exercises) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(exercises);
    }
  });
});

// Route to add a new user
app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body;

  const newUser = new User({ username });

  newUser.save((err, user) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(user);
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
