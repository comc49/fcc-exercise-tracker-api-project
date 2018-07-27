const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
var userSchema = mongoose.Schema({
  username: String,
  exercises: [{
    exercise: {
      description: String,
      duration: Number,
      date: Date,
    }
  }]
});

var userModel = mongoose.model('user',userSchema);

app.post('/api/exercise/new-user', function(req,res) {
  var p = userModel.create({username: req.body.username},(err,doc) => {
    res.send({doc});
    console.log(doc);
  });
});

app.post('/api/exercise/add', function(req,res) {
  userModel.findByIdAndUpdate(req.body.userId,{$push:
  { 
    "exercises": {
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
    }
  }
  }, {new: true},
    (err, user) => {
    console.log(user,'user');
    
  });
  
  console.log("HI");
});
///api/exercise/log?{userId}[&from][&to][&limit]
app.get('/api/exercise/log', function(req,res) {
  
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

