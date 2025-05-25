const userModel = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = "1234";
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require('fs');
const eventModel = require("../Models/EventModel");


const userController = {
  register: async (req, res) => {
    try {
      const { email, password, name, role} = req.body;

      // Check if the user already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new userModel({
        email,
        password: hashedPassword,
        name,
        role,
      });

      // Save the user to the database
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "email not found" });
      }

      console.log("password: ", user.password);
      // Check if the password is correct

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(405).json({ message: "incorect password" });
      }

      const currentDateTime = new Date();
      const expiresAt = new Date(+currentDateTime + 1800000); // expire in 30 minutes
      
      console.log("User Role:", user.role); // Debugging: Check if role exists
      // Generate a JWT token

      const token = jwt.sign(
        { user: { userId: user._id, role: user.role } },
        secretKey,
        {
          expiresIn: 3 * 60 * 60,
        }
      );

      return res.cookie("token", token, {
        expires: expiresAt,
        httpOnly: true,
        secure: false, // set to false for localhost testing
        sameSite: "lax",
        path: '/',
        domain: 'localhost'
      })
        .status(200)
        .json({ message: "login successfully", user });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.find();
      return res.status(200).json(users);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
  
      const user = await userModel.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        {
          new: true,
        }
      );
      return res.status(200).json({ user, msg: "User updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const user = await userModel.findByIdAndDelete(req.params.id);
      return res.status(200).json({ user, msg: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await userModel.findById(userId).select('-password'); // Exclude password from the response
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  updateCurrentUserProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const updates = {};
      const allowedFields = ["name", "email"];
      allowedFields.forEach(field => {
        if (req.body[field]) updates[field] = req.body[field];
      });
  
      const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const id=req.params.id;
      const { role } = req.body;

      console.log("User ID:", id); // Debugging
      console.log("New Role:", role); // Debugging
  
      const allowedRoles = ["admin", "user", "organizer"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      console.log("Updating user role in the database..."); // Debugging
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { role },
        { new: true}
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Updated User:", updatedUser); // Debugging

      res.status(200).json({ message: "User role updated", user: updatedUser });  
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  
  forgetPassword: async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "Email, current password, and new password are required" });
      }

      // Find user by email
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password matches
      const isCurrentPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Check if new password is same as current password
      const isNewPasswordSameAsCurrent = await bcrypt.compare(newPassword, user.password);
      if (isNewPasswordSameAsCurrent) {
        return res.status(400).json({ message: "New password must be different from current password" });
      }

      // Hash and save new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateProfilePicture: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.userId;
      const fileName = req.file.filename;
      // Include the full server URL
      const fileUrl = `http://localhost:5000/uploads/${fileName}`;

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { profilePicture: fileUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Profile picture updated successfully",
        profilePicture: fileUrl
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteProfilePicture: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Find the user and get their current profile picture URL
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user has a profile picture
      if (user.profilePicture) {
        // Extract filename from URL
        const fileName = user.profilePicture.split('/').pop();
        const filePath = path.join(__dirname, '..', 'uploads', fileName);

        // Try to delete the file if it exists
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error("Error deleting file:", err);
          // Continue even if file deletion fails
        }

        // Update user in database to remove profile picture URL
        user.profilePicture = '';
        await user.save();
      }

      res.status(200).json({
        message: "Profile picture removed successfully",
        profilePicture: ''
      });
    } catch (error) {
      console.error("Error removing profile picture:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  logout: async (req, res) => {
    try {
      // Clear the token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: 'lax',
        path: '/'
      });
      
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  checkEventOrganizer: async (req, res) => {
    try {
      const userId = req.user.userId;
      const eventId = req.params.eventId;
      
      const user = await userModel.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is admin
      const isAdmin = user.role === 'admin';
      
      // If user is admin, they have full access
      if (isAdmin) {
        return res.status(200).json({
          isAuthorized: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      // If user is not an organizer, they are not authorized
      if (user.role !== 'organizer') {
        return res.status(200).json({
          isAuthorized: false,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      // Find the event and check if this organizer owns it
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if the user is the organizer of this specific event
      const isEventOrganizer = event.organizer.toString() === userId;

      res.status(200).json({
        isAuthorized: isEventOrganizer,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error checking event organizer:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

//hello world !!

module.exports = userController;