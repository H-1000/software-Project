const express = require('express');
const router = express.Router();
const authenticationMiddleware=require('../Middleware/authenticationMiddleware')
const bookingController = require('../Controllers/bookingController');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');

 //Book tickets for an event
router.post(
  '/',authenticationMiddleware,
  authorizationMiddleware(['user']),
  bookingController.bookTickets
);

//  Get all bookings for the currently logged-in user
router.get(
  '/my',authenticationMiddleware,
  authorizationMiddleware(['user']),
  bookingController.getUserBookings
);

//  Get booking details by ID (only owner or admin)
router.get(
  '/:id',authenticationMiddleware,
  authorizationMiddleware(['user', 'admin']),
  bookingController.getBookingById
);

// Cancel a booking (only owner or admin)
router.delete(
  '/:id',authenticationMiddleware,
  authorizationMiddleware(['user', 'admin']),
  bookingController.cancelBooking
);

// Admin: Get all bookings
router.get(
  '/',authenticationMiddleware,
  authorizationMiddleware(['admin']),
  bookingController.getAllBookings
);

// Admin: Get all bookings by specific user ID
router.get(
  '/user/:userId',authenticationMiddleware,
  authorizationMiddleware(['admin']),
  bookingController.getUserBookingsByAdmin
);

module.exports = router;