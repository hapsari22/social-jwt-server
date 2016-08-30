var facebook       = require("./facebook.util.js");
var jwt            = require("./jwt.util.js");
var express        = require("express");
var bodyParser     = require("body-parser");
var app            = express();
const CORS_DOMAINS = process.env.CORS_DOMAINS || "*";
const PORT         = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CORS_DOMAINS);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post("/auth", (req, res) => {
  var socialToken        = req.body.socialToken;
  var longLivedRequested = Boolean(req.body.longLived);

  if (longLivedRequested) {
    var promise = facebook.requestLongLivedToken(socialToken).then((longLivedResponse) => {
      var longLivedToken = facebook.parseAccessToken(longLivedResponse).token;
      return facebook.findProfile(longLivedToken);
    });
  }
  else {
    var promise = facebook.findProfile(socialToken);
  }

  promise.then((profile) => {
    res.send(jwt.createToken(profile));
  }).catch((err) => {
    res.send(`Failed! ${err.message}`);
  });
});

app.get("/secure", (req, res) => {
  var jwtString = req.query.jwt;
  try {
    var profile = jwt.verify(jwtString);
    res.send(`You are good people: ${profile.id}`);
  } catch (err) {
    res.send("Hey, you are not supposed to be here!");
  }
});

app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}.`);
});
