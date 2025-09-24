const express = require("express");
const router = express.Router();

// Controllers
const { login, changePassword } = require("../controllers/auth");

// Resetpassword controllers
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/resetPassword");

// Middleware
const { auth } = require("../middleware/auth");

// Routes for Login, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login);

// Route for Changing the password
router.post("/changepassword", auth, changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

module.exports = router;
