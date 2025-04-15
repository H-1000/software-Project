const Booking = require('../Models/booking');
const Event = require('../Models/event');

const bookingController = {

  bookTickets: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { eventId, ticketsBooked } = req.body;

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
        ticketsBooked,
        totalPrice,
        status: "Confirmed",
      });

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
      const bookings = await Booking.find({ user: userId }).populate("event");
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getBookingById: async (req, res) => {
    try {
      const foundBooking = await Booking.findById(req.params.id).populate("event");

      if (!foundBooking) return res.status(404).json({ message: "Booking not found" });

      const isOwner = foundBooking.user.toString() === req.user.userId;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.status(200).json(foundBooking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const foundBooking = await Booking.findById(req.params.id);
      if (!foundBooking) return res.status(404).json({ message: "Booking not found" });

      const isOwner = foundBooking.user.toString() === req.user.userId;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (foundBooking.status === "Canceled") {
        return res.status(400).json({ message: "Booking already canceled" });
      }

      const event = await Event.findById(foundBooking.event);
      event.remainingTickets += foundBooking.ticketsBooked;

      foundBooking.status = "Canceled";

      await event.save();
      await foundBooking.save();

      res.status(200).json({ message: "Booking canceled successfully", booking: foundBooking });
    } catch (error) {
      console.error("Cancel error:", error);
      res.status(500).json({ message: "Server error" });
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
