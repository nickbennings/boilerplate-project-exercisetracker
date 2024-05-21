const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const exercise = require('./routes/exercise');
const { notFound, errors } = require('./middleware/handleErrors');

const port = process.env.PORT || 3000;
const app = express();

mongoose.Promise = global.Promise;
mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost/exercise_track_db',
    { useNewUrlParser: true }
  )
  .catch(err => console.log(`Error: ${err.message}`));

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.use('/api/exercise', exercise);

app.use(notFound);
app.use(errors);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
