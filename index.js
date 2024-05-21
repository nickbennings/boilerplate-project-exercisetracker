const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bodyParser = require('body-parser');
require('dotenv').config()


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseSchema = new Schema({
  username: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
  user_id: String
});

let Exercise = mongoose.model('Exercise', exerciseSchema);

const userSchema = new Schema({
  username: String
});

let User = mongoose.model('User', userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/users", function(req, res) {
  let name = req.body.username

  let recordUser = new User({ username: name })

  recordUser.save(function(err, recordUser) {
    if (err) {
      return console.log(err)
    }
    res.json({ username: recordUser.username, _id: recordUser._id });
  })

});

app.get("/api/users", function(req, res){
  User.find({}, function(err, users){
    let usersArray = []

    if (err) return console.log(err)

    users.forEach(function(user){
      usersArray.push({username: user.username, _id: user._id})
    })

    res.json(usersArray)
  })
})


app.post("/api/users/:_id/exercises", function(req, res){
  let user_id = req.params._id

  User.findById(user_id, function(err ,user){
    if (err) return console.log(err)

    let username = user.username
    let description = req.body.description
    let duration = parseInt(req.body.duration)
    let date = req.body.date ? new Date(req.body.date) : new Date()

    let recordExercise = new Exercise({username: username, description: description, duration: duration, date: date, user_id: user_id})

    recordExercise.save(function(err, exercise){
      if (err) return console.log(err)

      res.json({username: username, description: description, duration: duration, date: date.toDateString(), _id: user_id})
    }) 

  })    
})



app.get("/api/users/:_id/logs", function(req, res){
    let user_id = req.params._id
    let limite = req.query.limit ? parseInt(req.query.limit) : 0
    let desde = req.query.from ? new Date(req.query.from) : new Date(0);
    let hasta = req.query.to ? new Date(req.query.to) : new Date(); 
    
  
    User.findById(user_id, function(err, user){
      if (err) return console.log(err)
      if (user == undefined) return console.log("User not found")
  
      let log = []
  
      Exercise.find({user_id: user_id, date: {$gt: desde, $lt: hasta}})
              .limit(limite)
              .exec(function(err, exercises){
                if (err) return console.log(err)

                exercises.forEach(function(exercise){
                  log.push({
                    description: exercise.description,
                    duration: exercise.duration,
                    date: exercise.date.toDateString() 
                  })
                })

                res.json({
                    _id: user_id,
                    username: user.username,
                    count: log.length,
                    log: log
                  }) 
              })
              
    })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
