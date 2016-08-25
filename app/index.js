var express           = require("express");
var bodyParser        = require("body-parser")
var jwt               = require("jsonwebtoken");
var request           = require("request");
var app               = express();
const facebookAppId   = process.env.FACEBOOK_APP_ID;
const tokenSecretKey  = process.env.TOKEN_SECRET_KEY;
const tokenExpiration = process.env.TOKEN_EXPIRATION;
const tokenIssuer     = process.env.TOKEN_ISSUER;
const port            = 3000;
const facebookApi     = "https://graph.facebook.com/me";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post("/auth", (req, res) => {
  var socialToken = req.body.socialToken;
  validateSocialToken(socialToken).then((profile) => {
    res.send(createJwt(profile));
  }).catch((err) => {
    res.send(`Failed! ${err.message}`);
  });
});

app.get("/secure", (req, res) => {
  var jwtString = req.query.jwt;
  try {
    var profile = verifyJwt(jwtString);
    res.send(`You are good people: ${profile.id}`);
  } catch (err) {
    res.send("Hey, you are not supposed to be here");
  }
});


function validateSocialToken(socialToken) {
  return new Promise((resolve, reject) => {
    request({
        url: facebookApi,
        qs: {access_token: socialToken}
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      }
    );
  });
}

function createJwt(profile) {
  var token = jwt.sign(profile, tokenSecretKey, {
    expiresIn: tokenExpiration,
    issuer:    tokenIssuer
  });
  console.log("Token:", token);
  return token;
}

function verifyJwt(jwtString) {
  return jwt.verify(jwtString, tokenSecretKey, {
    issuer: tokenIssuer
  });
}

app.listen(port, () => {
  console.log(`Authentication server running on port ${port}`);
});
