const express = require('express');
const router = express.Router()

const userController = require('../Controllers/user.controller');

router.post("/login", userController.login);

router.post("/register", userController.register);

router.post("/logout", userController.logout);

router.put("/forgetPassword", userController.forgetPassword);

module.exports = router;