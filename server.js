const express = require('express');
const mongoose = require('mongoose'); 

const cors = require('cors'); 
const cookieParser = require('cookie-parser');


const app = express(); //creating an application

const mongoURI='mongodb+srv://adminHamid:Test123@cluster0.nr1om.mongodb.net/event-booking?retryWrites=true&w=majority&appName=Cluster07'

console.log('hello')




const eventRouter = require('./routes/Events'); //importing the events router

const bookingRouter = require('./routes/booking'); //importing the booking router

const userRouter = require('./routes/User'); //importing the user router   

const authRouter = require('./routes/auth')


const authenticationMiddleware =require('./Middleware/authenticationMiddleware')

require('dotenv').config();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
)


app.use('/auth', authRouter);
app.use(authenticationMiddleware); //using the authentication middleware

app.use('/events', eventRouter); 
app.use('/booking', bookingRouter); 
app.use('/User', userRouter);


mongoose
.connect(mongoURI)
.then(() => {
    console.log('MongoDB connected!');
})
.catch(e => {
    console.error('MongoDB connection error:', e);
}); 

app.use(function (req, res, next) {
    return res.status(404).send("404");
  });
 

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000'); 
});

