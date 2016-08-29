var express             = require("express");
var bodyParser          = require("body-parser")
var jwt                 = require("jsonwebtoken");
var request             = require("request");
var app                 = express();
const facebookAppId     = process.env.FACEBOOK_APP_ID;
const facebookSecretKey = process.env.FACEBOOK_SECRET_KEY;
const tokenSecretKey    = process.env.TOKEN_SECRET_KEY;
const tokenExpiration   = process.env.TOKEN_EXPIRATION;
const tokenIssuer       = process.env.TOKEN_ISSUER;
const corsDomains       = process.env.CORS_DOMAINS || "*";
const port              = 3000;
const facebookApi       = "https://graph.facebook.com";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", corsDomains);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post("/auth", (req, res) => {
  var socialToken        = req.body.socialToken;
  var longLivedRequested = Boolean(req.body.longLived);
  validateSocialToken(socialToken, longLivedRequested).then((profile) => {
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


function validateSocialToken(socialToken, longLivedRequested) {
  return new Promise((resolve, reject) => {
    var endpoint = longLivedRequested ? longLivedToken : facebookVerification;
    request(longLivedToken,
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

function facebookVerification(shortLivedToken) {
  return {
    url: `${facebookApi}/me`,
    qs: {
      access_token: shortLivedToken
    }
  };
}

function longLivedToken(shortLivedToken) {
  return {
    url: `${facebookApi}/oauth/access_token`,
    qs: {
      grant_type: "fb_exchange_token",
      fb_exchange_token: shortLivedToken,
      client_id: facebookAppId,
      client_secret: facebookSecretKey,

    }
  };
}

function createJwt(profile) {
  var token = jwt.sign(profile, tokenSecretKey, {
    expiresIn: tokenExpiration,
    issuer:    tokenIssuer
  });
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
