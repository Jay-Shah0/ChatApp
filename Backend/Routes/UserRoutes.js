const express = require("express")
const { RegisterUser, AuthUser,SearchUser } = require("../Controllers/UserControllers");
const { protect } = require("../middleware/AuthMiddleware")

const Router = express.Router()

Router.route("/").post(RegisterUser).get( SearchUser ); 
Router.route("/login").post(AuthUser);
Router.route("/")

module.exports = Router;