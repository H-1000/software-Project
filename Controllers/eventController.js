const eventModel = require('../Models/EventModel');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const userModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const { get } = require('mongoose');

const eventController = {
   
    getAllEvents: async (req, res) => {
        try {
            const events = await eventModel.find({});
            res.status(200).json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getEventById: async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await eventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(event);
        } catch (error) {
            console.error('Error fetching event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    createEvent: async (req, res) => {
        try {
            const user = req.user;
            if (!user || user.role !== 'organizer') {
                return res.status(403).json({ message: 'Unauthorized' });
            }
    
            const { title, description, date, location, category, image, ticketPrice, totalTickets } = req.body;
    
            if (!title || !description || !date || !location || !ticketPrice || !totalTickets) {
                return res.status(400).json({ message: 'Please fill in all required fields' });
            }
    
            const newEvent = new eventModel({
                title,
                description,
                date,
                location,
                category,
                image,
                ticketPrice,
                totalTickets,
                remainingTickets: totalTickets,
                organizer: user._id,
                status: 'pending'
            });
    
            await newEvent.save();
            res.status(201).json(newEvent);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateEvent: async (req, res) => {
        try {
            const eventId = req.params.id;
            const updatedData = req.body;
    
            const updatedEvent = await eventModel.findByIdAndUpdate(eventId, updatedData, { new: true });
            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
    
            res.status(200).json(updatedEvent);
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },    

    deleteEvent : async (req, res) => {

        try{
        const eventId=req.params.id;
        const user =req.user;

        if(!user ||user.role !== 'oraganizer' && user.role !== 'admin'){
            return res.status(403).json({message:'Unauthorized'});
        }

        //to find and delete the event

        const event = await eventModel.findByIdAndDelete(eventId);
        
        if(!event){//if not found
            return res.status(404).json({message:'Event not found'});
        }
        return res.status(200).json({message:'Event deleted successfully'})

        }catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getEventsByOrganizer: async (req, res) => {
        try {
            const user = req.user;
            if (!user || user.role !== 'organizer') {
                return res.status(403).json({ message: 'Unauthorized' });
            }
    
            const events = await eventModel.find({ organizer: user._id });
            res.status(200).json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateEventStatus: async (req,res) =>{

        try {
            const user = req.user; // Get the authenticated user

            // Ensure the user is an admin
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const eventId = req.params.id;
            const { status } = req.body; // Expecting 'status' field in the request body

            // Check if the status is valid
            if (!status || !['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            // Find the event and update its status
            const updatedEvent = await eventModel.findByIdAndUpdate(
                eventId,
                { status },
                { new: true } // Return the updated event
            );

            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            res.status(200).json({ message: `Event ${status} successfully`, event: updatedEvent });
        } catch (error) {
            console.error('Error updating event status:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getEventAnalytics: async (req, res) => {
        try {
          const organizerId = req.user.userId;
    
          // Fetch events created by this organizer
          const events = await Event.find({ organizer: organizerId });
    
          const analytics = events.map(event => {
            const bookedTickets = event.totalTickets - event.remainingTickets;
            const percentageBooked = ((bookedTickets / event.totalTickets) * 100).toFixed(2);
    
            return {
              eventId: event._id,
              title: event.title,
              bookedTickets,
              totalTickets: event.totalTickets,
              remainingTickets: event.remainingTickets,
              percentageBooked: Number(percentageBooked)
            };
          });
    
          return res.status(200).json({ analytics });
        } catch (error) {
          console.error("Error getting event analytics:", error);
          res.status(500).json({ message: "Server error while fetching analytics" });
        }
      },


};

module.exports = eventController;