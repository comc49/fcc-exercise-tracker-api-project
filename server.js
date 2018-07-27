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

function validateDate(date) {
  if (new Date(date)) return true;
  return false;
}
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var userSchema = mongoose.Schema({
  username: { type:String, unique: true },
});

var exerciseSchema = mongoose.Schema({
    userId: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, validate: validateDate },
});

var userModel = mongoose.model('user',userSchema);
var exerciseModel = mongoose.model('exercise',exerciseSchema);

app.post('/api/exercise/new-user', function(req,res) {
  var p = userModel.create({username: req.body.username},(err,doc) => {
    res.send({ _id: doc._id, username: doc.username});
    console.log(doc);
  });
});

app.post('/api/exercise/add', function(req,res) {
  console.log(req.body,'body');
  exerciseModel.create(
  {
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date,
  },
  (err, exercise) => {
    if (err) {
          console.log(err,'err');
    }
    //{"username":"sdfasdfsaf","description":"sup","duration":10,"_id":"H1aV5n_V7","date":"Sun Oct 10 2010"}
      res.send({ 
        description: exercise.description,
        duration: exercise.duration,
        _id: exercise.id,
        date: exercise.date
      });
    });
  });
///api/exercise/log?{userId}[&from][&to][&limit]
app.get('/api/exercise/log', function(req,res) {
  let queryBuilder = exerciseModel.find().where('userId').equals(req.query.userId);  
  
  if (req.query.from) {
    queryBuilder = queryBuilder.where('date').gte(new Date(req.query.from));
  }
  if (req.query.to) {
    queryBuilder = queryBuilder.where('date').lte(new Date(req.query.to));
  }
  if (req.query.limit) {
    queryBuilder = queryBuilder.limit(Number(req.query.limit));
  }
  queryBuilder.exec((err,doc) => {
    if (err) console.log(err);
    res.send(doc);
  });
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

