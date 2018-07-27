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
  exercises: [{
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      date: { type: Date, validate: validateDate }
    }
  ]
});

var userModel = mongoose.model('user',userSchema);

app.post('/api/exercise/new-user', function(req,res) {
  var p = userModel.create({username: req.body.username},(err,doc) => {
    res.send({ _id: doc._id, username: doc.username});
    console.log(doc);
  });
});

app.post('/api/exercise/add', function(req,res) {
  userModel.findByIdAndUpdate(req.body.userId,
  {
    $push:
      { 
        "exercises": {
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date
        }
      }
  },
  {
    new: true
  },
  (err, user) => {
    if (err) {
      
    }
    //{"username":"sdfasdfsaf","description":"sup","duration":10,"_id":"H1aV5n_V7","date":"Sun Oct 10 2010"}
      console.log(JSON.stringify(user),'user'); 
    });
  });
///api/exercise/log?{userId}[&from][&to][&limit]
app.get('/api/exercise/log', function(req,res) {
  console.log(req.query);
  let queryBuilder = userModel.findById(req.query.userId);
  if (req.query.from) {
    queryBuilder = queryBuilder.where('exercises.date').gte(new Date(req.query.from));
  }
  
  if (req.query.test) {
    queryBuilder = queryBuilder.where('this.exercises.test').gte('5');
  }
  
  if (req.query.to) {
    queryBuilder = queryBuilder.where('date').lte(new Date(req.query.to));
  }
  
  if (req.query.limit) {
    queryBuilder = queryBuilder.limit(req.query.limit);
  }
  console.log("HELLO???");
  queryBuilder.exec((err,doc) => {
    if (err) console.log(err);
    console.log("WHAT",doc);
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

