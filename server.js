const express = require('express');

const app = express(); //creating an application

app.get('/', (req, res) => {

    res.send("Hello World!"); //sending response to the client

})



const eventRouter = require('./routes/Events'); //importing the events router

app.use('/events', eventRouter); //using the events router for all requests to /events

app.listen(3000)
