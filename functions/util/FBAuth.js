const { admin, db } = require("./admin");
var jwt = require("jsonwebtoken");
var NodeRSA = require("node-rsa");
var fs = require("fs");
const { private_key } = JSON.parse(
  fs.readFileSync(__dirname + "/../service-account.json", "utf8")
);
var key = new NodeRSA(private_key).exportKey("pkcs8-public-pem");

module.exports = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    customToken = req.headers.authorization.split("Bearer ")[1];
    jwt.verify(customToken, key, { algorithms: ["RS256"] }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(403).json(err);
      }
      var { roomCode, name } = JSON.parse(token.uid); //try catch the parse
      req.name = name;
      req.roomCode = roomCode;
    });
  } else {
    console.error("No token found");
    req.name = null;
    req.roomCode = null;
  }
  return next();
};
