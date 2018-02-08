function findCors() {
  var domain = process.env.CORS_DOMAINS;
  if (domain == null || domain == undefined) {
    return "*";
  }
  else {
    if (domain.startsWith("http")) {
      return domain;
    }
    else {
      return new RegExp(domain);
    }
  }
}

var jwt            = require("./jwt.util.js");
var express        = require("express");
var bodyParser     = require("body-parser");
var cors           = require("cors");
var app            = express();
const CORS_DOMAINS = findCors();
const PORT         = process.env.PORT || 3000;
const PROVIDERS    = [require("./facebook.util.js"), require("./google.util.js")]

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors({
  "origin": CORS_DOMAINS
}));

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
      console.log(err);
      res.status(401).json({error: `Failed! ${err ? err.error.message : ""}`});
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

app.get("/health", (req, res) => {
  res.json({status: "ok"});
});

app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}.`);
  console.log(`${PROVIDERS.length} providers registered.`);
});
