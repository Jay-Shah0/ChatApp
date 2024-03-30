const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../Controllers/MessageControllers.js");
const { protect } = require("../middleware/AuthMiddleware");

const Router = express.Router();

Router.route("/:chatId").get(protect, allMessages);
Router.route("/").post(protect, sendMessage);

module.exports = Router;