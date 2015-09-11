// Downloads DB dump from bungie manifest and creates our definition files
// Taken and modified from kyleshays DIM repo
// https://github.com/kyleshay/DIM/blob/master/build/processBungieManifest.js

var http = require('http');
var fs = require('fs');

var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var unzip = require('unzip');

var db;
var dbFile;
var version;

function onManifestRequest(error, response, body) {
  var parsedResponse = JSON.parse(body);
  var manifestFile = fs.createWriteStream('manifest.zip');

  version = parsedResponse.Response.version;

  var exists = fs.existsSync(version + '.txt');

  // if (!exists) {
  // var versionFile = fs.createWriteStream(version + '.txt');
  // versionFile.write(JSON.stringify(parsedResponse, null, 2));
  // versionFile.end();

  request
    .get('http://www.bungie.net' + parsedResponse.Response.mobileWorldContentPaths.en)
    .pipe(manifestFile)
    .on('close', onManifestDownloaded);
  // } else {
  //   console.log('Version already exist, \'' + version + '\'.');
  // }
}

function onManifestDownloaded() {
  fs.createReadStream('manifest.zip')
    .pipe(unzip.Parse())
    .on('entry', function(entry) {
      ws = fs.createWriteStream('manifest/' + entry.path);

      ws.on('finish', function() {
        var exists = fs.existsSync('manifest/' + entry.path);

        if (exists) {
          extractDB('manifest/' + entry.path);
        }
      });

      entry.pipe(ws);
    });
}

function extractDB(dbFile) {
  db = new sqlite3.Database(dbFile);

  db.all('SELECT * FROM DestinyInventoryItemDefinition', function(err, rows) {
    if (err) {
      throw err;
    }

    var DestinyArmorDefinition = {};
    var DestinySubclassDefinition = {};
    var DestinyWeaponDefinition = {};

    rows.forEach(function(row) {
      var item = JSON.parse(row.json);

      // Armor
      if (item.itemType === 2) {
        DestinyArmorDefinition[item.itemHash] = {};
        DestinyArmorDefinition[item.itemHash].name = item.itemName;
        DestinyArmorDefinition[item.itemHash].description = item.itemDescription;
        DestinyArmorDefinition[item.itemHash].icon = item.icon;
        DestinyArmorDefinition[item.itemHash].subType = item.itemSubType;
        DestinyArmorDefinition[item.itemHash].bucketTypeHash = item.bucketTypeHash;
      }

      // Weapons
      if ((item.itemType === 3) && (item.bucketTypeHash !== 2422292810)) {
        DestinyWeaponDefinition[item.itemHash] = {};
        DestinyWeaponDefinition[item.itemHash].name = item.itemName;
        DestinyWeaponDefinition[item.itemHash].icon = item.icon;
        DestinyWeaponDefinition[item.itemHash].subType = item.itemSubType;
      }

      switch (item.bucketTypeHash) {
        // Subclass
        case 3284755031:
          DestinySubclassDefinition[item.itemHash] = {};
          DestinySubclassDefinition[item.itemHash].name = item.itemName;
          break;
      }
    });

    var stream = fs.createWriteStream('app/scripts/definitions/en/DestinyArmorDefinition.js');
    stream.write('var DestinyArmorDefinition = ');
    stream.write(JSON.stringify(DestinyArmorDefinition, null, 2));
    stream.write(';');
    stream.end();

    var stream = fs.createWriteStream('app/scripts/definitions/en/DestinySubclassDefinition.js');
    stream.write('var DestinySubclassDefinition = ');
    stream.write(JSON.stringify(DestinySubclassDefinition, null, 2));
    stream.write(';');
    stream.end();

    var stream = fs.createWriteStream('app/scripts/definitions/en/DestinyWeaponDefinition.js');
    stream.write('var DestinyWeaponDefinition = ');
    stream.write(JSON.stringify(DestinyWeaponDefinition, null, 2));
    stream.write(';');
    stream.end();
  });
}

request
  .get('http://www.bungie.net/platform/Destiny/Manifest/', onManifestRequest);
