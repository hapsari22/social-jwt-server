var jwt            = require("./jwt.util.js");
var express        = require("express");
var bodyParser     = require("body-parser");
var app            = express();
const CORS_DOMAINS = process.env.CORS_DOMAINS || "*";
const CORS_SUFFIX  = process.env.CORS_SUFFIX || null;
const PORT         = process.env.PORT || 3000;
const PROVIDERS    = [require("./facebook.util.js"), require("./google.util.js")]

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use((req, res, next) => {
  if (CORS_SUFFIX != null && req.hostname.endsWith(CORS_SUFFIX)) {
    res.header("Access-Control-Allow-Origin", req.protocol + "://" + req.hostname);
  }
  else {
    res.header("Access-Control-Allow-Origin", CORS_DOMAINS);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function findProvider(req) {
  return PROVIDERS.find((provider) => {
    return provider.matches(req);
  });
}

app.post("/auth", (req, res) => {
  var provider = findProvider(req);
  if (provider !== null && provider !== undefined) {
    provider.requestProfile(req).then((response) => {
      res.json({
        accessToken: jwt.createToken(response.socialProfile),
        socialToken: response.socialToken
      });
    }).catch((err) => {
      res.status(401).json({error: `Failed! ${err.message}`});
    });
  }
  else {
    res.status(401).json({error: "no_provider_found"});
  }
});

app.get("/secure", (req, res) => {
  var jwtString = req.query.jwt;
  try {
    var profile = jwt.verify(jwtString);
    res.json({success: true});
  } catch (err) {
    res.status(401).json({error: "wrong_token"});
  }
});

app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}.`);
  console.log(`${PROVIDERS.length} providers registered.`);
});
