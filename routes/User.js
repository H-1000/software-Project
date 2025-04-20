const express = require('express')
const userController = require("../Controllers/user.controller")
const authorizationMiddleware = require('../Middleware/authorizationMiddleware')
const eventController =require('../Controllers/eventController')
const bookingController = require('../Controllers/bookingController')
const authenticationMiddleware = require('../Middleware/authenticationMiddleware')
const router = express.Router()


router.get('/',authenticationMiddleware,authorizationMiddleware(['admin']),userController.getAllUsers);//admins can get all users

router.get('/profile', authenticationMiddleware,authorizationMiddleware(['admin', 'user', 'organizer']), userController.getCurrentUser);


router.put('/profile', authenticationMiddleware,authorizationMiddleware(['admin', 'user', 'organizer']), userController.updateCurrentUserProfile);

// act as if the booking is ready //
router.get('/bookings', authenticationMiddleware,authorizationMiddleware(['user']), bookingController.getUserBookings);


router.get('/events', authenticationMiddleware,authorizationMiddleware(['organizer']), eventController.getEventsByOrganizer);

router.get('/events/analytics', authenticationMiddleware,authorizationMiddleware(['organizer']), eventController.getEventAnalytics);

router.get('/:id/events',authenticationMiddleware,authorizationMiddleware(['admin','organizer']),eventController.getEventsByOrganizer);

router.put('/:id',authenticationMiddleware,authorizationMiddleware(['admin']),userController.updateUserRole);//admins can update the user role

router.get('/:id',authenticationMiddleware,authorizationMiddleware(['admin']),userController.getUser);

//to update a user
router.put('/:id',authenticationMiddleware,authorizationMiddleware(['admin','user','organizer']),userController.updateUser);// think abt that again

router.delete('/:id',authenticationMiddleware,authorizationMiddleware(['admin']),userController.deleteUser);//admins can delete any user

module.exports =router