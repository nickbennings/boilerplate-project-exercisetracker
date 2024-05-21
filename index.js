const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new Schema({
  username: { type: String, required: true },
  log: [exerciseSchema]
});

const User = mongoose.model('User', userSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  try {
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (error) {
    res.status(400).send('Error creating user');
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.status(400).send('Error fetching users');
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  let newDate = date ? new Date(date) : new Date();

  try {
    const user = await User.findById(_id);
    user.log.push({ description, duration, date: newDate });
    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      description,
      duration,
      date: newDate.toDateString()
    });
  } catch (error) {
    res.status(400).send('Error adding exercise');
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  try {
    let user = await User.findById(_id);
    let log = user.log;

    if (from || to) {
      let fromDate = from ? new Date(from) : new Date(0);
      let toDate = to ? new Date(to) : new Date();

      log = log.filter((exercise) => {
        let exerciseDate = new Date(exercise.date);
        return exerciseDate >= fromDate && exerciseDate <= toDate;
      });
    }

    if (limit) {
      log = log.slice(0, +limit);
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))
    });
  } catch (error) {
    res.status(400).send('Error fetching logs');
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

