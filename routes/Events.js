const express =require('express');
const router = express.Router();
const eventController = require('../Controllers/eventController');
const authMiddleware = require('../Middleware/authMiddleware');


router.get('/', eventController.getAllEvents); // Get all events
router.get('/my-events', authMiddleware.authenticateUser, eventController.getEventsByOrganizer); // Get events created by the authenticated user
router.get('/:id', eventController.getEventById); // Get event by ID


router.post('/', authMiddleware.authenticateUser,authMiddleware.authorizeRoles('organizer') ,eventController.createEvent); // Create a new event

router.put('/:id',authMiddleware.authenticateUser,authMiddleware.authorizeRoles('organizer','admin') ,eventController.updateEvent);//update the event by user or admin

router.delete('/:id', authMiddleware.authenticateUser,authMiddleware.authorizeRoles('organizer','admin') ,eventController.deleteEvent); // Delete an event by ID

router.patch('/:id/status', authMiddleware.authenticateUser,authMiddleware.authorizeRoles('admin') ,eventController.updateEventStatus); // Update event status by admin


module.exports=router; 