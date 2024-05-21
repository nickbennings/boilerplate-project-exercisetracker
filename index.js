const express = require('express');
const app = express();
const assert = require('assert');

// Create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  const user = new User({ username });

  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Add an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const exercise = new Exercise({ username: user.username, description, duration, date });
    await exercise.save();

    res.json({ ...user.toJSON(), ...exercise.toJSON() });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Retrieve exercise logs for a user
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    let query = { username: user.username };
    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    let logQuery = Exercise.find(query);
    if (limit) {
      logQuery = logQuery.limit(parseInt(limit));
    }

    const log = await logQuery.exec();
    res.json({ ...user.toJSON(), count: log.length, log });
  } catch (err) {
    res.status(400).send(err);
  }
});
