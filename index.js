const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// Set up middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

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

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/exercise/new-user', async (req, res) => {
  const { username } = req.body;
  const user = new User({ username });

  try {
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/api/exercise/add', async (req, res) => {
  const { userId, description, duration, date } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    const exercise = new Exercise({ username: user.username, description, duration, date });

    await exercise.save();

    res.json(exercise);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/api/exercise/log', async (req, res) => {
  const { userId, from, to, limit } = req.query;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    let query = { username: user.username };

    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    } else if (from) {
      query.date = { $gte: new Date(from) };
    } else if (to) {
      query.date = { $lte: new Date(to) };
    }

    let log = await Exercise.find(query).limit(parseInt(limit) || 0);

    res.json({ username: user.username, count: log.length, log });
  } catch (err) {
    res.status(400).send(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
