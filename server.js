const express = require('express');
const mongoose = require('mongoose'); 

const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express(); //creating an application


const eventRouter = require('./routes/Events'); //importing the events router

const bookingRouter = require('./routes/bookings'); //importing the booking router

const userRouter = require('./routes/User'); //importing the user router   

const authRouter = require('./routes/auth')


const authenticationMiddleware =require('./Middleware/authenticationMiddleware')

require('dotenv').config();

// Middleware
// CORS should be first
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
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

// 404 handler
app.use(function (req, res, next) {
    return res.status(404).send("404");
  });
 
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`); 
});

