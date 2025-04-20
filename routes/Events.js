const express =require('express');
const router = express.Router();
const eventController = require('../Controllers/eventController');
const authenticationMiddleware = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');


router.get('/all' ,authenticationMiddleware,authorizationMiddleware(['admin']),eventController.getAllEvents); // Get all events
router.get('/',eventController.getAllApprovedEvents); //public can see all approved events
router.get('/:id', eventController.getEventById); // Get event by ID

router.post('/', authenticationMiddleware,authorizationMiddleware(['organizer']),eventController.createEvent); // Create a new event

router.put('/:id',authenticationMiddleware,authorizationMiddleware(['admin','organizer']) ,eventController.updateEvent);//update the event by user or admin

router.delete('/:id',authenticationMiddleware, authorizationMiddleware(['admin','organizer']) ,eventController.deleteEvent); // Delete an event by ID

router.patch('/:id/status',authenticationMiddleware, authorizationMiddleware(['admin']) ,eventController.updateEventStatus); // Update event status by admin


module.exports=router; 