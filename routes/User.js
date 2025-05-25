const express = require('express')
const userController = require("../Controllers/user.controller")
const authorizationMiddleware = require('../Middleware/authorizationMiddleware')
const eventController =require('../Controllers/eventController')
const bookingController = require('../Controllers/bookingController')
const authenticationMiddleware = require('../Middleware/authenticationMiddleware')
const router = express.Router()
const upload = require('../Middleware/uploadMiddleware');

// Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Profile routes
router.get('/profile', authenticationMiddleware, authorizationMiddleware(['admin', 'user', 'organizer']), userController.getCurrentUser);
router.put('/profile', authenticationMiddleware, authorizationMiddleware(['admin', 'user', 'organizer']), userController.updateCurrentUserProfile);
router.post('/profile/picture', authenticationMiddleware, authorizationMiddleware(['admin', 'user', 'organizer']), upload.single('profilePicture'), userController.updateProfilePicture);
router.delete('/profile/picture', authenticationMiddleware, authorizationMiddleware(['admin', 'user', 'organizer']), userController.deleteProfilePicture);

// Event routes
router.get('/events', authenticationMiddleware, authorizationMiddleware(['organizer']), eventController.getEventsByOrganizer);
router.get('/events/analytics', authenticationMiddleware, authorizationMiddleware(['organizer']), eventController.getEventAnalytics);
router.get('/check-organizer/:eventId', authenticationMiddleware, userController.checkEventOrganizer);

// Admin routes
router.get('/', authenticationMiddleware, authorizationMiddleware(['admin']), userController.getAllUsers);
router.route('/:id')
  .get(authenticationMiddleware, authorizationMiddleware(['admin']), userController.getUser)
  .put(authenticationMiddleware, authorizationMiddleware(['admin']), userController.updateUserRole)
  .delete(authenticationMiddleware, authorizationMiddleware(['admin']), userController.deleteUser);

// Parameterized routes should come last
router.get('/:id/events', authenticationMiddleware, authorizationMiddleware(['admin', 'organizer']), eventController.getEventsByOrganizer);

module.exports = router