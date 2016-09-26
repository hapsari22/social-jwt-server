var request              = require("request");

const GOOGLE_APP_ID       = process.env.GOOGLE_APP_ID;
const GOOGLE_API          = "https://www.googleapis.com";
const GOOGLE_SECRET_KEY   = process.env.GOOGLE_SECRET_KEY;
const GOOGLE_FIELDS       = "email,id,name";
const GOOGLE_ACCESS_TYPE  = "offline";
const GOOGLE_GRANT_TYPE   = "authorization_code";
const GOOGLE_REDIRECT_URI = "postmessage";

function createResponse(accessToken, refreshToken, profileGoogle) {
  var response = {
    socialProfile: {
      googleId: profileGoogle.id,
      name:     profileGoogle.name,
      email:    profileGoogle.email
    },
    socialToken: {
      accessToken: accessToken
    }
  };

  if (refreshToken !== null && refreshToken !== undefined) {
    response.socialToken.refreshToken = refreshToken;
  }
  return response;
}

function findProfile(accessToken, refreshToken) {
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `${GOOGLE_API}/userinfo/v2/me`,
      qs: {
        fields: GOOGLE_FIELDS
      },
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var profileGoogle = JSON.parse(body);
        resolve(createResponse(accessToken, refreshToken, profileGoogle));
      } else {
        console.log("Error when accessing Google API", error, response.body.error);
        reject(response.body.error);
      }
    });
  });
}

function requestAccessToken(oneTimeCode) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${GOOGLE_API}/oauth2/v4/token`,
      form: {
        client_id:     GOOGLE_APP_ID,
        client_secret: GOOGLE_SECRET_KEY,
        access_type:   GOOGLE_ACCESS_TYPE,
        grant_type:    GOOGLE_GRANT_TYPE,
        code:          oneTimeCode,
        redirect_uri:  GOOGLE_REDIRECT_URI
      }
    }, (error, response, body) => {
      if (!body.error && response.statusCode == 200) {
        resolve(JSON.parse(body));
      } else {
        reject(body);
      }
    });
  });
}

function readOneTimeCodeIn(req) {
  return req.body.googleOneTimeCode;
}

function isEnabled() {
  return GOOGLE_APP_ID !== null && GOOGLE_APP_ID !== undefined;
}

module.exports = {
  requestProfile: (req) => {
    var oneTimeCode = readOneTimeCodeIn(req);

    return requestAccessToken(oneTimeCode)
      .then((tokenResponse) => {
        var longLivedRequested = Boolean(req.body.longLived);
        var accessToken        = tokenResponse.access_token;
        if (longLivedRequested) {
          var refreshToken = tokenResponse.refresh_token;
          return findProfile(accessToken, refreshToken);
        }
        else {
          return findProfile(accessToken, null);
        }
      });
  },

  matches: (req) => {
    var code = readOneTimeCodeIn(req);
    return code !== null && code !== undefined && isEnabled();
  }
}
