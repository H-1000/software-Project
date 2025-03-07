const mongoose = require('mongoose');

const bookingSchema= new mongoose.Schema({
   
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },

    ticketsBooked: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Canceled"], 
    default: "Pending" 
  },

  BookedAt :{
    type: Date,
    default : ()=> Date.now()
}

  
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;