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

  if (longLivedRequested) {
    requestLongLivedToken(socialToken).then((longLivedResponse) => {
      var parsedResponse = parseFacebookToken(longLivedResponse);
      var longLivedToken = parsedResponse.token;
      console.log("Long live token found."+longLivedToken);
      return identifySocialToken(longLivedToken);
    }).then((profile) => {
      console.log("Profile found using long lived token.");
      profile.isLongLived = longLivedRequested;
      res.send(createJwt(profile));
    })
    .catch((err) => {
      res.send(`Failed! ${err.message}`);
    });
  }
  else {
    identifySocialToken(socialToken).then((profile) => {
      console.log("Profile found using short lived token.");
      profile.isLongLived = longLivedRequested;
      res.send(createJwt(profile));
    }).catch((err) => {
      res.send(`Failed! ${err.message}`);
    });
  }
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

function identifySocialToken(socialToken) {
  console.log("Identify social token against Facebook.");
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `${facebookApi}/me`,
      qs: {
        access_token: socialToken
      }
    }, (error, response, body) => {
      console.log("Response received from facebook:"+JSON.stringify(response));
      if (!error && response.statusCode == 200) {
        var profileFacebook = JSON.parse(body);
        profileFacebook.facebookAccessToken = socialToken;
        console.log("Resolve: "+profileFacebook);
        resolve(profileFacebook);
      } else {
        reject(error);
      }
    });
  });
}

function requestLongLivedToken(shortLivedToken) {
  console.log("Request Long Lived Token");
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `${facebookApi}/oauth/access_token`,
      qs: {
        grant_type: "fb_exchange_token",
        fb_exchange_token: shortLivedToken,
        client_id: facebookAppId,
        client_secret: facebookSecretKey
      }
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

function createJwt(profile, accessToken) {
  return jwt.sign(profile, tokenSecretKey, {
    expiresIn: tokenExpiration,
    issuer:    tokenIssuer
  });
}

function verifyJwt(jwtString) {
  return jwt.verify(jwtString, tokenSecretKey, {
    issuer: tokenIssuer
  });
}

function parseFacebookToken(facebookResponse) {
  var regexp = /^access_token=([a-zA-Z0-9]+)&expires=([0-9]+)$/;
  var match;
  if ((match = regexp.exec(facebookResponse)) !== null) {
      if (match.index === regexp.lastIndex) {
          regexp.lastIndex++;
      }
      console.log("Regexp OK:"+match);
      return {
        token:      match[1],
        expiration: match[2]
      };
  }
  return {};
}

app.listen(port, () => {
  console.log(`Authentication server running on port ${port}`);
});
