var request               = require("request");
const FACEBOOK_API        = "https://graph.facebook.com";
const FACEBOOK_FIELDS     = "email,name,locale";
const FACEBOOK_VERSION    = process.env.FACEBOOK_VERSION;
const FACEBOOK_APP_ID     = process.env.FACEBOOK_APP_ID;
const FACEBOOK_SECRET_KEY = process.env.FACEBOOK_SECRET_KEY;

function findProfile(socialToken) {
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `${FACEBOOK_API}/${FACEBOOK_VERSION}/me`,
      qs: {
        access_token: socialToken,
        fields: FACEBOOK_FIELDS
      }
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var profileFacebook = JSON.parse(body);
        profile = {
          facebookId:   profileFacebook.id,
          name:         profileFacebook.name,
          email:        profileFacebook.email,
          locale:       profileFacebook.locale
        }
        resolve({
          socialProfile: profile,
          socialToken: socialToken
        });
      } else {
        reject(error);
      }
    });
  });
}

function parseAccessToken(facebookResponse) {
  return JSON.parse(facebookResponse).access_token;
}

function requestLongLivedToken(shortLivedToken) {
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `${FACEBOOK_API}/${FACEBOOK_VERSION}/oauth/access_token`,
      qs: {
        grant_type: "fb_exchange_token",
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
  return req.body.facebookToken;
}

function isEnabled() {
  return FACEBOOK_APP_ID !== null && FACEBOOK_APP_ID !== undefined;
}

module.exports = {
  requestProfile: (req) => {
    var socialToken        = readSocialTokenIn(req);
    var longLivedRequested = Boolean(req.body.longLived);
    if (longLivedRequested) {
      return requestLongLivedToken(socialToken).then((longLivedResponse) => {
        var longLivedToken = parseAccessToken(longLivedResponse);
        return findProfile(longLivedToken);
      });
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
