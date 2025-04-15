const express = requrie('express')
const userController = requrie("../Controllers/user.controller")
const authorizationMiddleware = requrie('../Middleware/authorizationMiddleware')
const eventController =requrie('../Controllers/eventController')
const bookingController = requrie('../Controllers/bookingController')
const router = express.Router()


router.get('/',authorizationMiddleware(['admin']),userController.getAllUsers);//admins can get all users

router.get('/profile', authorizationMiddleware(['admin', 'user', 'organizer']), userController.getCurrentUser);

//to get a specific user by their id 
router.get('/:id',authorizationMiddleware(['admin']),userController.getUser);

//to update a user
router.put('/:id',authorizationMiddleware(['admin']),userController.updateUser);// think abt that again

router.delete('/:id',authorizationMiddleware(['admin']),userController.deleteUser);//admins can delete any user
//to get the events created by the user
//admins and organizers can get the events created by the user
router.get('/:id/events',authorizationMiddleware(['admin','organizer']),eventController.getEventsByOrganizer);



router.put('/profile', authorizationMiddleware(['admin', 'user', 'organizer']), userController.updateCurrentUserProfile);

// act as if the booking is ready //
router.get('/bookings', authorizationMiddleware(['user']), bookingController.getUserBookings);


router.get('/events', authorizationMiddleware(['organizer']), eventController.getEventsByOrganizer);

router.get('/events/analytics', authorizationMiddleware(['organizer']), eventController.getEventAnalytics);


//add a new event
router.put("/:id/events/add/:eventId",authorizationMiddleware(['admin','organizer']),eventController.createEvent);//think abt that

//to remove an event 
router.delete("/:id/events/remove/:eventId",authorizationMiddleware(['admin','organizer']),eventController.deleteEvent);//think abt that


module.exports =router