const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;
const TOKEN_ISSUER     = process.env.TOKEN_ISSUER;
const TOKEN_ALGORITHM  = process.env.TOKEN_ALGORITHM || "HS512";
var jwt                = require("jsonwebtoken");

module.exports = {
  createToken: (content) => {
    return jwt.sign(content, TOKEN_SECRET_KEY, {
      algorithm: TOKEN_ALGORITHM,
      expiresIn: TOKEN_EXPIRATION,
      issuer:    TOKEN_ISSUER
    });
  },

  verify: (token) => {
    return jwt.verify(token, TOKEN_SECRET_KEY, {
      issuer: TOKEN_ISSUER
    });
  }
}
