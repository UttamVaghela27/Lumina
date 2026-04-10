const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function identifyUser(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Session expired or invalid token" });
    }

    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          message: "User not found or account deactivated",
        });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Authentication internal error" });
  }
}

module.exports = identifyUser;
