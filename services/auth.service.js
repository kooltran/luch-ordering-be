const jwt = require("jsonwebtoken");
const User = require("../models/user");

// check if Token exists on request Header and attach token to request as attribute
exports.checkTokenMW = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    req.token = bearerHeader.split(" ")[1];
    next();
  } else {
    res.sendStatus(403);
  }
};

// Verify Token validity and attach token data as request attribute
exports.verifyToken = (req, res, next) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const user = await User.findById(authData.userId);
      req.user = user;
      next();
    }
  });
};

// Issue Token
exports.signToken = user => {
  return jwt.sign({ userId: user._id }, "secretkey");
};
