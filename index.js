const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Exercise schema
const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
});

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  log: [exerciseSchema],
});

// Define models
const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Routes
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  try {
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (error) {
    res.status(400).json({ error: 'Username already taken' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const exercise = new Exercise({
      description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
    });
    user.log.push(exercise);
    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  try {
    let user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    let log = user.log;
    if (from || to) {
      let fromDate = new Date(0);
      let toDate = new Date();
      if (from) {
        fromDate = new Date(from);
      }
      if (to) {
        toDate = new Date(to);
      }
      log = log.filter((exercise) => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate >= fromDate && exerciseDate <= toDate;
      });
    }
    if (limit) {
      log = log.slice(0, parseInt(limit));
    }
    user = user.toJSON();
    user.count = log.length;
    user.log = log;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Default route for root path
app.get('/', (req, res) => {
  res.send('Welcome to the exercise tracker API!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
