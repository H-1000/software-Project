const Booking = require('../Models/bookingModel');
const Event = require('../Models/EventModel');

const bookingController = {

  bookTickets: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { eventId, ticketsBooked, name, email, phone, specialRequirements } = req.body;
      
      console.log('Booking request data:', { eventId, ticketsBooked, name, email, phone, specialRequirements }); // Debug log

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.remainingTickets < ticketsBooked) {
        return res.status(400).json({ message: "Not enough tickets available" });
      }

      const totalPrice = event.ticketPrice * ticketsBooked;

      const newBooking = new Booking({
        user: userId,
        event: eventId,
        name,
        email,
        phone,
        specialRequirements,
        ticketsBooked,
        totalPrice,
        status: "Confirmed",
      });

      console.log('New booking to be saved:', newBooking); // Debug log

      await newBooking.save();

      event.remainingTickets -= ticketsBooked;
      await event.save();

      return res.status(201).json({ message: "Booking successful", booking: newBooking });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log('Fetching bookings for user:', userId);
      
      // First get all bookings without population
      let bookings;
      try {
        bookings = await Booking.find({ user: userId });
        console.log('Found raw bookings:', bookings.length);
      } catch (error) {
        console.error('Error fetching raw bookings:', error);
        return res.status(500).json({ message: "Error fetching bookings" });
      }

      // Populate events one by one to handle deleted events
      const populatedBookings = [];
      for (const booking of bookings) {
        try {
          const bookingObj = booking.toObject();
          try {
            if (booking.event) {
              const event = await Event.findById(booking.event);
              bookingObj.event = event || null;
            } else {
              bookingObj.event = null;
            }
          } catch (eventError) {
            console.log('Error fetching event for booking:', booking._id, eventError);
            bookingObj.event = null;
          }
          populatedBookings.push(bookingObj);
        } catch (bookingError) {
          console.error('Error processing booking:', booking._id, bookingError);
          // Continue with other bookings even if one fails
        }
      }

      console.log('Successfully populated bookings:', populatedBookings.length);

      // Sort bookings: Active first, then Canceled, then Deleted
      const sortedBookings = populatedBookings.sort((a, b) => {
        try {
          // Put deleted events at the bottom
          if (!a.event && b.event) return 1;
          if (a.event && !b.event) return -1;
          
          // Then put canceled ones above deleted but below others
          if (a.status === 'Canceled' && b.status !== 'Canceled' && b.event) return 1;
          if (a.status !== 'Canceled' && b.status === 'Canceled' && a.event) return -1;
          
          // For same status bookings, sort by date
          const dateA = a.event ? new Date(a.event.date) : new Date(a.BookedAt);
          const dateB = b.event ? new Date(b.event.date) : new Date(b.BookedAt);
          return dateB - dateA;
        } catch (sortError) {
          console.error('Error during sorting:', sortError);
          return 0; // Keep original order if sort fails
        }
      });

      console.log('Sending sorted bookings to client');
      res.status(200).json(sortedBookings);
    } catch (error) {
      console.error("Error in getUserBookings:", error);
      res.status(500).json({ 
        message: "Failed to load bookings", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  getBookingById: async (req, res) => {
    try {
      const foundBooking = await Booking.findById(req.params.id);
      if (!foundBooking) return res.status(404).json({ message: "Booking not found" });

      const isOwner = foundBooking.user.toString() === req.user.userId;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Try to populate event, handle case where event might be deleted
      const bookingObj = foundBooking.toObject();
      try {
        const event = await Event.findById(foundBooking.event);
        bookingObj.event = event;
      } catch (error) {
        console.log('Event not found for booking:', foundBooking._id);
        bookingObj.event = null;
      }

      res.status(200).json(bookingObj);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      console.log('Attempting to cancel booking:', req.params.id);
      
      const foundBooking = await Booking.findById(req.params.id);
      if (!foundBooking) {
        console.log('Booking not found:', req.params.id);
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log('Found booking:', foundBooking);

      const isOwner = foundBooking.user.toString() === req.user.userId;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        console.log('Access denied. User:', req.user.userId, 'Booking owner:', foundBooking.user);
        return res.status(403).json({ message: "Access denied" });
      }

      if (foundBooking.status === "Canceled") {
        return res.status(400).json({ message: "Booking already canceled" });
      }

      // Try to update event tickets if event still exists
      try {
        const event = await Event.findById(foundBooking.event);
        if (event) {
          event.remainingTickets += foundBooking.ticketsBooked;
          await event.save();
        } else {
          console.log('Event not found for booking:', foundBooking._id);
        }
      } catch (error) {
        console.log('Error updating event tickets:', error);
        // Continue with booking cancellation even if event update fails
      }

      // Update booking status
      foundBooking.status = "Canceled";
      await foundBooking.save();

      // Return the updated booking with populated event (if it exists)
      const bookingObj = foundBooking.toObject();
      try {
        const event = await Event.findById(foundBooking.event);
        bookingObj.event = event;
      } catch (error) {
        console.log('Event not found for booking:', foundBooking._id);
        bookingObj.event = null;
      }

      res.status(200).json({ 
        message: "Booking canceled successfully", 
        booking: bookingObj 
      });
    } catch (error) {
      console.error("Cancel error details:", error);
      res.status(500).json({ message: "Server error", details: error.message });
    }
  },

  getAllBookings: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await Booking.find().populate("user").populate("event");
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserBookingsByAdmin: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const userId = req.params.userId;
      const bookings = await Booking.find({ user: userId }).populate("event");
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching user's bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

};

module.exports = bookingController;