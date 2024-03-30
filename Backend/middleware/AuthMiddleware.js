const jwt = require("jsonwebtoken");
const User = require("../Model/UserModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
    res.status(401);
    throw new Error("Not authorized, token has expired");
  } else if (error.name === "JsonWebTokenError") {
    res.status(401);
    throw new Error("Not authorized, invalid token");
  } else {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };