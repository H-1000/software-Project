const express =require('express');
const router = express.Router();
const eventController = require('../Controllers/eventController');
const authMiddleware = require('../Middleware/authorizationMiddleware');
const authenticationMiddleware = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');


router.get('/',authorizationMiddleware(['admin','organizer']) ,eventController.getAllEvents); // Get all events
router.get('/my-events', authorizationMiddleware(['admin','organizer']), eventController.getEventsByOrganizer); // Get events created by the authenticated user
router.get('/:id', eventController.getEventById); // Get event by ID


router.post('/', authorizationMiddleware(['organizer']),eventController.createEvent); // Create a new event

router.put('/:id',authorizationMiddleware(['admin','organizer']) ,eventController.updateEvent);//update the event by user or admin

router.delete('/:id', authorizationMiddleware(['admin','organizer']) ,eventController.deleteEvent); // Delete an event by ID

router.patch('/:id/status', authorizationMiddleware(['admin']) ,eventController.updateEventStatus); // Update event status by admin


module.exports=router; 