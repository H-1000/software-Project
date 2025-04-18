const express = require('express');

const mongoose = require('mongoose'); 
const mongoUrl='mongodb+srv://adminHamid:Test123@cluster0.nr1om.mongodb.net/event-booking?retryWrites=true&w=majority&appName=Cluster07'

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(' MongoDB connected!'))
  .catch(err => console.error(' MongoDB connection error:', err));



const app = express(); //creating an application

app.get('/', (req, res) => {

    res.send("Hello World!"); //sending response to the client

})



const eventRouter = require('./routes/Events'); //importing the events router

app.use('/events', eventRouter); //using the events router for all requests to /events

app.listen(3000)
