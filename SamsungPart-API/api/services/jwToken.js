const jwt = require('jsonwebtoken');
module.exports.issue = function(payload) {
   return jwt.sign(
     payload,
     sails.config.jwt_secret,
     {
       expiresIn : 604800
     }
   );
 };
 
 module.exports.verify = function(token, callback) {
   return jwt.verify(
     token, 
     sails.config.jwt_secret, 
     {},
     callback 
   );
 };