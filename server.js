const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose'); 
const cookieParser = require('cookie-parser');
const authenticationMiddleware = require('./Middleware/authenticationMiddleware');
const authorizationMiddleware = require('./Middleware/authorizationMiddleware');

// Create the express application first
const app = express(); //creating an application

// Middleware setup
app.use(cookieParser()); // Use cookie parser before anything else
app.use(authenticationMiddleware); // Use authentication middleware for all routes

const mongoURI = 'mongodb+srv://adminHamid:Test123@cluster0.nr1om.mongodb.net/event-booking?retryWrites=true&w=majority&appName=Cluster07';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define routes
app.get('/', (req, res) => {
    res.send("Hello World!"); // sending response to the client
});

// Protected route with authorization middleware
app.use('/someProtectedRoute', authorizationMiddleware(['admin', 'user']), (req, res) => {
    res.send('Welcome to protected route');
});

// Import routers and use them
const eventRouter = require('./routes/Events'); 
app.use('/events', eventRouter); 

const bookingRouter = require('./routes/booking'); 
app.use('/booking', bookingRouter);

const userRouter = require('./routes/user');  
app.use('/User', userRouter);

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000'); 
});

