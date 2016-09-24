var request               = require("request");

const GOOGLE_APP_ID       = process.env.GOOGLE_APP_ID;

function readSocialTokenIn(req) {
  return req.body.googleToken;
}

function isEnabled() {
  return GOOGLE_APP_ID !== null && GOOGLE_APP_ID !== undefined;
}

module.exports = {
  requestProfile: (req) => {
    return null; //TODO
  },

  matches: (req) => {
    return req.googleToken !== null && req.googleToken !== undefined && isEnabled();
  }
}
