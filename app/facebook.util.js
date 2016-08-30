var request                 = require("request");
const FACEBOOK_TOKEN_REGEXP = /^access_token=([a-zA-Z0-9]+)&expires=([0-9]+)$/;
const FACEBOOK_API          = "https://graph.facebook.com";
const FACEBOOK_APP_ID       = process.env.FACEBOOK_APP_ID;
const FACEBOOK_SECRET_KEY   = process.env.FACEBOOK_SECRET_KEY;

module.exports = {
  parseAccessToken: (facebookResponse) => {
    var match;
    if ((match = FACEBOOK_TOKEN_REGEXP.exec(facebookResponse)) !== null) {
        if (match.index === FACEBOOK_TOKEN_REGEXP.lastIndex) {
            regexp.lastIndex++;
        }
        return {
          token:      match[1],
          expiration: match[2]
        };
    }
    return {};
  },

  findProfile: (socialToken) => {
    return new Promise((resolve, reject) => {
      request({
        method: "GET",
        url: `${FACEBOOK_API}/me`,
        qs: {
          access_token: socialToken
        }
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          var profileFacebook = JSON.parse(body);
          profileFacebook.facebookAccessToken = socialToken;
          resolve(profileFacebook);
        } else {
          reject(error);
        }
      });
    });
  },

  requestLongLivedToken: (shortLivedToken) => {
    return new Promise((resolve, reject) => {
      request({
        method: "GET",
        url: `${FACEBOOK_API}/oauth/access_token`,
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
}
