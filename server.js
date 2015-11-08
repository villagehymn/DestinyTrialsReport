'use strict';

var compression = require('compression');
var express = require('express');
var subdomain = require('express-subdomain');
var request = require('request');
var throng = require('throng');

throng(start, {
  workers: process.env.WEB_CONCURRENCY || 1,
  lifetime: Infinity
});

function start() {
  var app = express();
  app.use(compression());
  app.use(express.static(__dirname));

  // Internal API Proxy
  app.use('/api/*?', function(req, res) {
    if (req.headers[process.env.AUTH]) {
      var options = {
        url: 'http://api.destinytrialsreport.com' + req.originalUrl,
        headers: {'X-API-Key': process.env.BUNGIE_API_KEY}
      };
      req.pipe(request(options)).pipe(res);
    } else {
      res.send('Nope');
    }
  });

  // Guardian.net API Proxy
  app.use('/ggg/*?', function(req, res) {
    var options = {
      url: 'https://api.guardian.gg/' + req.originalUrl.replace("/ggg/", ""),
      headers: {'X-API-Key': process.env.BUNGIE_API_KEY}
    };
    req.pipe(request(options)).pipe(res);
  });

  // DestinyTrialsReport
  app.get('/:platform/:playerName', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });
  app.get('/:platform/:playerOne/:playerTwo/:playerThree', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  // MyTrialsReport
  var router = express.Router();
  router.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });
  router.get('/:platform/:playerName', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });
  app.use(subdomain('my', router));

  // Bungie API Proxy
  app.use('/Platform/*?', function(req, res) {
    if (req.headers[process.env.AUTH]) {
      var options = {
        url: 'https://www.bungie.net' + req.originalUrl,
        headers: {'X-API-Key': process.env.BUNGIE_API_KEY}
      };
      req.pipe(request(options)).pipe(res);
    } else {
      res.send('Nope');
    }
  });

  // CORS
  app.all('*', function (req, res) {
    res.header('Access-Control-Allow-Origin', 'http://www.destinytrialsreport.com');
  });

  // Start server
  var port = process.env.PORT || 9000;
  app.listen(port, function () {
    console.log('Listening on port ' + port);
  });
}
