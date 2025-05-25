const eventModel = require('../Models/EventModel');
const jwt = require('jsonwebtoken');
const secretKey = "1234";
const mongoose = require('mongoose');
const userModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const { get } = require('mongoose');

const eventController = {
   
    getAllEvents: async (req, res) => {
        try {
            console.log('getAllEvents called');
            console.log('User from request:', req.user);

            if (!req.user || req.user.role !== 'admin') {
                console.log('Unauthorized access attempt:', req.user);
                return res.status(403).json({ message: 'Unauthorized: Admin access required' });
            }

            console.log('Fetching all events from database...');
            const events = await eventModel.find({})
                .populate({
                    path: 'organizer',
                    select: 'name email profilePicture',
                    model: userModel
                });
            
            console.log('Found events count:', events.length);
            console.log('Events with populated organizers:', 
                events.map(e => ({
                    id: e._id,
                    title: e.title,
                    organizerId: e.organizer?._id,
                    organizerName: e.organizer?.name
                }))
            );
            
            // Format events with proper organizer data
            const formattedEvents = events.map(event => {
                const plainEvent = event.toObject();
                console.log('Processing event:', {
                    id: plainEvent._id,
                    title: plainEvent.title,
                    hasOrganizer: !!plainEvent.organizer
                });
                return {
                    ...plainEvent,
                    organizer: plainEvent.organizer ? {
                        _id: plainEvent.organizer._id,
                        name: plainEvent.organizer.name,
                        email: plainEvent.organizer.email,
                        profilePicture: plainEvent.organizer.profilePicture
                    } : null
                };
            });

            console.log('Formatted events count:', formattedEvents.length);
            console.log('Sample formatted event:', formattedEvents[0]);
            res.status(200).json(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getEventById: async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await eventModel.findById(eventId)
                .populate({
                    path: 'organizer',
                    select: 'name email profilePicture',
                    model: userModel
                });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Format the response to match the frontend expectations
            const formattedEvent = {
                ...event.toObject(),
                organizer: event.organizer ? {
                    _id: event.organizer._id,
                    name: event.organizer.name,
                    email: event.organizer.email,
                    profilePicture: event.organizer.profilePicture
                } : null
            };

            res.status(200).json(formattedEvent);
        } catch (error) {
            console.error('Error fetching event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    createEvent: async (req, res) => {
        try {
            const user = req.user;
            console.log("User in createEvent:", req.user);

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
                organizer: new mongoose.Types.ObjectId(user.userId),
                status: 'pending'
            });
    
            await newEvent.save();

            // Populate the organizer data before sending response
            await newEvent.populate({
                path: 'organizer',
                select: 'name email profilePicture',
                model: userModel
            });

            res.status(201).json(newEvent);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateEvent: async (req, res) => {
        try {
            const eventId = req.params.id;
            const userId = req.user.userId;
            const userRole = req.user.role;

            // Find the event first
            const event = await eventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Check if user is admin or the event organizer
            if (userRole !== 'admin' && (userRole !== 'organizer' || event.organizer.toString() !== userId)) {
                return res.status(403).json({ message: 'Unauthorized: Only the event organizer or admin can update this event' });
            }

            const updatedData = req.body;
            
            // Ensure ticket numbers are properly parsed as integers
            if (updatedData.totalTickets) {
                updatedData.totalTickets = parseInt(updatedData.totalTickets);
            }
            if (updatedData.remainingTickets) {
                updatedData.remainingTickets = parseInt(updatedData.remainingTickets);
            }
            if (updatedData.ticketPrice) {
                updatedData.ticketPrice = Number(updatedData.ticketPrice);
            }
    
            const updatedEvent = await eventModel.findByIdAndUpdate(eventId, updatedData, { new: true });
            res.status(200).json(updatedEvent);
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },    

    deleteEvent: async (req, res) => {
        try {
            const eventId = req.params.id;
            const userId = req.user.userId;
            const userRole = req.user.role;

            // Find the event first
            const event = await eventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Check if user is admin or the event organizer
            if (userRole !== 'admin' && (userRole !== 'organizer' || event.organizer.toString() !== userId)) {
                return res.status(403).json({ message: 'Unauthorized: Only the event organizer or admin can delete this event' });
            }

            await eventModel.findByIdAndDelete(eventId);
            return res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getEventsByOrganizer: async (req, res) => {
        try {
            console.log('Getting events for organizer. User:', req.user);
            
            if (!req.user || !req.user.userId) {
                console.log('No user ID found in request');
                return res.status(403).json({ message: 'No user ID found' });
            }

            if (req.user.role !== 'organizer') {
                console.log('User is not an organizer:', req.user.role);
                return res.status(403).json({ message: 'User is not an organizer' });
            }
            
            console.log('Finding events for organizer:', req.user.userId);
            const events = await eventModel.find({ organizer: req.user.userId })
                .populate({
                    path: 'organizer',
                    select: 'name email profilePicture',
                    model: userModel
                });
            
            console.log('Found events:', events.length);
            
            // Even if no events, return an empty array instead of 404
            const formattedEvents = events.map(event => {
                const plainEvent = event.toObject();
                return {
                    ...plainEvent,
                    organizer: plainEvent.organizer ? {
                        _id: plainEvent.organizer._id,
                        name: plainEvent.organizer.name,
                        email: plainEvent.organizer.email,
                        profilePicture: plainEvent.organizer.profilePicture
                    } : null
                };
            });
            
            console.log('Formatted events:', formattedEvents.length);
            res.status(200).json(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getAllApprovedEvents: async (req, res) => {
        try {
            const events = await eventModel.find({ status: "approved" })
                .populate({
                    path: 'organizer',
                    select: 'name email profilePicture',
                    model: userModel
                });

            // Format events with proper organizer data
            const formattedEvents = events.map(event => {
                const plainEvent = event.toObject();
                return {
                    ...plainEvent,
                    organizer: plainEvent.organizer ? {
                        _id: plainEvent.organizer._id,
                        name: plainEvent.organizer.name,
                        email: plainEvent.organizer.email,
                        profilePicture: plainEvent.organizer.profilePicture
                    } : null
                };
            });

            res.status(200).json(formattedEvents);
        } catch (error) {
            console.error('Error fetching approved events:', error);
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
          const events = await eventModel.find({ organizer: organizerId });
    
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