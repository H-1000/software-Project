const express = require('express');
const router = express.Router();

const bookingController = require('../Controllers/bookingController');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');

 //Book tickets for an event
router.post(
  '/',
  authorizationMiddleware(['user']),
  bookingController.bookTickets
);

//  Get all bookings for the currently logged-in user
router.get(
  '/my',
  authorizationMiddleware(['user']),
  bookingController.getUserBookings
);

//  Get booking details by ID (only owner or admin)
router.get(
  '/:id',
  authorizationMiddleware(['user', 'admin']),
  bookingController.getBookingById
);

// Cancel a booking (only owner or admin)
router.delete(
  '/:id',
  authorizationMiddleware(['user', 'admin']),
  bookingController.cancelBooking
);

// Admin: Get all bookings
router.get(
  '/',
  authorizationMiddleware(['admin']),
  bookingController.getAllBookings
);

// Admin: Get all bookings by specific user ID
router.get(
  '/user/:userId',
  authorizationMiddleware(['admin']),
  bookingController.getUserBookingsByAdmin
);

module.exports = router;