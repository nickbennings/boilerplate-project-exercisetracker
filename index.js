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

// Route to get a list of all users
app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(users);
    }
  });
});

// Route to add an exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  User.findById(_id, (err, user) => {
    if (err) {
      res.status(500).send(err);
    } else if (!user) {
      res.status(404).send("User not found");
    } else {
      const newExercise = new Exercise({
        username: user.username,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      });

      newExercise.save((err, exercise) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ username: user.username, ...exercise.toObject() });
        }
      });
    }
  });
});

// Route to retrieve a full exercise log of any user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  User.findById(_id, (err, user) => {
    if (err) {
      res.status(500).send(err);
    } else if (!user) {
      res.status(404).send("User not found");
    } else {
      let query = { username: user.username };

      if (from || to) {
        query.date = {};
        if (from) query.date.$gte = new Date(from);
        if (to) query.date.$lte = new Date(to);
      }

      Exercise.find(query)
        .limit(limit ? parseInt(limit) : undefined)
        .exec((err, exercises) => {
          if (err) {
            res.status(500).send(err);
          } else {
            const log = exercises.map(exercise => exercise.toObject());
            res.json({ ...user.toObject(), log });
          }
        });
    }
  });
});

// Default route handler for root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Exercise Tracker App!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
