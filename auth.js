const jwt = require("jsonwebtoken");
const jwt_secret = "secret";

function auth(req, res, next) {
  const token = req.headers.authorization;

  const response = jwt.verify(token, jwt_secret);

  if (response) {
    req.userId = token.Id;
    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}

module.exports = {
  auth,
  jwt_secret,
};
