const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0p7gq.mongodb.net/event?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("event").collection("eventCollection");
  const userCollection = client.db("eventUser").collection("userCollection");

  //All the events I posted  with postman
  app.post('/uploadEvents', (req, res) => {
      const events  = req.body;
      collection.insertMany(events)
      .then(result => {
        res.send(result.insertedCount);
      })
  });
  // get 12 events from database
  app.get('/getEvents10', (req, res) => {
    collection.find({}).limit(12)
    .toArray( (err, documents) => {
        res.send(documents);
    });
  });
  // get all events from database
  app.get('/getEvents', (req, res) => {
    collection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    });
  });
  //get single event from database
  app.get('/getSingleEvent/:id', (req, res) => {
      const eventId = req.params.id;
    collection.find({_id: ObjectId(eventId)})
    .toArray( (err, documents) => {
        res.send(documents[0]);
    });
  });
  //add volunteer 
  app.post('/registerVolunteer', (req, res) => {
    userCollection.insertOne(req.body.volunteer)
    .then(result =>{
        res.send(result.insertedCount > 0);
    })
  });
  //get all registrations events by email
  app.get('/getAllRegEvents', (req, res) => {
      const email = req.query.email;
      userCollection.find({email: email})
      .toArray( (err, documents) => {
          res.send(documents);
      });
  });
  //delete
  app.delete('/deleteEventReg:id', (req, res) => {
    userCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then( result => {
        res.send(result.deletedCount > 0);
    })
  });
});

app.get('/', (req, res) => {
    res.send("hello world");
});

app.listen(process.env.PORT || 5000);  