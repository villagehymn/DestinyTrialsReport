var throng = require("throng");
var WORKERS = process.env.WEB_CONCURRENCY || 1;

throng(start, {
  workers: WORKERS,
  lifetime: Infinity
});

function start () {
  var compression = require("compression");
  var subdomain = require("express-subdomain");
  var express = require("express");
  var request = require("request");
  var app = express();

  var domain = require("domain");
  var d = domain.create();

  d.on("error", function(err) {
    console.error(err);
  });

  app.use(compression());
  app.use(express.static(__dirname));

  app.get("/:platform/:playerName", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/:platform/:playerOne/:playerTwo/:playerThree", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });

  var router = express.Router();

  router.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });

  router.get("/:platform/:playerName", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });

  app.use(subdomain("my", router));

  app.get("/Platform/*?", function (req, res) {
    res.setTimeout(25000);
    var api_key = process.env.BUNGIE_API;
    var options = {
      url: "https://www.bungie.net/" + req.originalUrl,
      headers: {
        "X-API-Key": api_key
      }
    };
    try {
      request(options, function (error, response, body) {
        if (!error) {
          res.send(body);
        } else {
          res.send(error);
        }
      });
    } catch(e) {

    }
  });

  app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://www.destinytrialsreport.com");
    return next();
  });

  var port = process.env.PORT || 9000;

  app.listen(port, function() {
    console.log("Listening on port " + port);
  });
}
