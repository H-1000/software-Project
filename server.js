const express = require('express');
const mongoose = require('mongoose'); 

const cors = require('cors'); 
const cookieParser = require('cookie-parser');


const app = express(); //creating an application


const eventRouter = require('./routes/Events'); //importing the events router

const bookingRouter = require('./routes/bookings'); //importing the booking router

const userRouter = require('./routes/user'); //importing the user router   

const authRouter = require('./routes/auth')


const authenticationMiddleware =require('./Middleware/authenticationMiddleware')

require('dotenv').config();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(
    cors({
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    })
  );


app.use('/api/v1', authRouter);


app.use('/api/v1/events', eventRouter); 
app.use('/api/v1/bookings', bookingRouter); 
app.use('/api/v1/users', userRouter);


const DB_NAME = process.env.DB_NAME; //MongoDB database name
const db_url = `${process.env.DB_URL}/${DB_NAME}`;


mongoose
.connect(db_url)
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
app.listen(process.env.PORT, () => {
    console.log('Server is running on port 3000'); 
});

