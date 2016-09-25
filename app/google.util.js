var request               = require("request");

const GOOGLE_APP_ID       = process.env.GOOGLE_APP_ID;
const GOOGLE_API          = "https://www.googleapis.com";
const GOOGLE_SECRET_KEY = process.env.GOOGLE_SECRET_KEY;
const GOOGLE_FIELDS       = "email,id,name";

function findProfile(socialToken) {
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `${GOOGLE_API}/userinfo/v2/me`,
      qs: {
        fields: GOOGLE_FIELDS
      },
      headers: {
        "Authorization": `Bearer ${socialToken}`
      }
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var profileGoogle = JSON.parse(body);
        profile = {
          googleId: profileGoogle.id,
          name:     profileGoogle.name,
          email:    profileGoogle.email
        }
        resolve({
          socialProfile: profile,
          socialToken: socialToken
        });
      } else {
        console.log("Error when accessing Google API", response.body.error);
        reject(response.body.error);
      }
    });
  });
}

function requestLongLivedToken(shortLivedToken) {
  return new Promise((resolve, reject) => {
    request({
      method: "POST",
      url: `${GOOGLE_API}/userinfo/v2/me`,
      qs: {
        grant_type: "refresh_token",
        fb_exchange_token: shortLivedToken,
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_SECRET_KEY
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

function readSocialTokenIn(req) {
  return req.body.googleToken;
}

function isEnabled() {
  return GOOGLE_APP_ID !== null && GOOGLE_APP_ID !== undefined;
}


// POST /oauth2/v4/token HTTP/1.1
// Host: www.googleapis.com
// Content-Type: application/x-www-form-urlencoded

// client_id=8819981768.apps.googleusercontent.com&
// client_secret={client_secret}&
// refresh_token=1/6BMfW9j53gdGImsiyUH5kU5RsR4zwI9lUVX-tqf8JXQ&
// grant_type=refresh_token

module.exports = {
  requestProfile: (req) => {
    var socialToken        = readSocialTokenIn(req);
    var longLivedRequested = Boolean(req.body.longLived);
    if (longLivedRequested) {
      return findProfile(socialToken);
      // return requestLongLivedToken(socialToken).then((longLivedResponse) => {
      //   var longLivedToken = parseAccessToken(longLivedResponse).token;
      //   return findProfile(longLivedToken);
      // });
    }
    else {
      return findProfile(socialToken);
    }
  },

  matches: (req) => {
    var token = readSocialTokenIn(req);
    return token !== null && token !== undefined && isEnabled();
  }
}
