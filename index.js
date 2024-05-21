const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define Mongoose schemas and models for Exercise, User, and Log
const ExerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

const UserSchema = new mongoose.Schema({
  username: String
});

const User = mongoose.model('User', UserSchema);

const LogSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [ExerciseSchema]
});

const Log = mongoose.model('Log', LogSchema);

// Routes
// Example route to create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example route to add exercise for a user
app.post('/api/users/:userId/exercises', async (req, res) => {
  try {
    const { userId } = req.params;
    const { description, duration, date } = req.body;
    const exercise = new Exercise({ 
      username: userId, 
      description, 
      duration, 
      date: date || new Date() 
    });
    await exercise.save();
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const listener = app.listen(PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
