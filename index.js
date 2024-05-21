require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema
const { Schema } = mongoose;

const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

const userSchema = new Schema({
  username: String,
  log: [exerciseSchema]
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    const savedUser = await newUser.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
    const user = await User.findById(_id);
    if (!user) throw new Error('User not found');
    const exercise = { description, duration: parseInt(duration), date: date ? new Date(date) : new Date() };
    user.log.push(exercise);
    await user.save();
    res.json({ username: user.username, _id: user._id, description, duration: exercise.duration, date: exercise.date.toDateString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);
    if (!user) throw new Error('User not found');
    let { from, to, limit } = req.query;
    if (from || to) {
      from = new Date(from);
      to = new Date(to);
      user.log = user.log.filter(exercise => {
        const exerciseDate = new Date(exercise.date);
        return (!from || exerciseDate >= from) && (!to || exerciseDate <= to);
      });
    }
    if (limit) {
      limit = parseInt(limit);
      user.log = user.log.slice(0, limit);
    }
    res.json({ _id: user._id, username: user.username, count: user.log.length, log: user.log });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
