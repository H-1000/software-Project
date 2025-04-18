const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose'); 
const mongoURI='mongodb+srv://adminHamid:Test123@cluster0.nr1om.mongodb.net/event-booking?retryWrites=true&w=majority&appName=Cluster07'

console.log('hello')
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
app.use('/events', eventRouter); 
const bookingRouter = require('./routes/booking'); //importing the booking router
app.use('/booking', bookingRouter); 
const userRouter = require('./routes/User'); //importing the user router   
app.use('/User', userRouter);
const authRouter = require('./routes/auth')
app.use('/auth', authRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000'); 
})
