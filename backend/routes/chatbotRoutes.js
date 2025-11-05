const express = require("express");
const router = express.Router();

const { getChatbotResponse } = require("../controllers/chatbotController");

router.post("/get-response", getChatbotResponse);

module.exports = router;
