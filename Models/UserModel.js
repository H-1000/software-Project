const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: "http://localhost:5000/uploads/defaultPP.JPG"
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'organizer'],
    default: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: () => Date.now()
  }
});

const user = mongoose.model('user', userSchema);
module.exports = user;