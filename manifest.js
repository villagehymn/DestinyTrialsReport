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
  var items = {};
  var primary = {};
  var special = {};
  var heavy = {};
  var armors = {};
  var emblems = {};
  var nodes = {};

  db.all('select * from DestinyInventoryItemDefinition', function(err, rows) {
    if (err) {
      throw err;
    }

    primary = {};
    special = {};
    heavy = {};
    armors = {};
    emblems = {};

    rows.forEach(function(row) {
      var item = JSON.parse(row.json);
      delete item.equippingBlock;
      if (item.bucketTypeHash === 1498876634) {
        primary[item.itemHash] = {};
        primary[item.itemHash].name = item.itemName;
        primary[item.itemHash].description = item.itemDescription;
        primary[item.itemHash].icon = '//www.bungie.net' + item.icon;
        primary[item.itemHash].subType = item.itemSubType;
      }else if (item.bucketTypeHash === 2465295065) {
        special[item.itemHash] = {};
        special[item.itemHash].name = item.itemName;
        special[item.itemHash].description = item.itemDescription;
        special[item.itemHash].icon = '//www.bungie.net' + item.icon;
        special[item.itemHash].subType = item.itemSubType;
      }else if (item.bucketTypeHash === 953998645) {
        heavy[item.itemHash] = {};
        heavy[item.itemHash].name = item.itemName;
        heavy[item.itemHash].description = item.itemDescription;
        heavy[item.itemHash].icon = '//www.bungie.net' + item.icon;
        heavy[item.itemHash].subType = item.itemSubType;
      }else if (item.itemType === 2) {
        armors[item.itemHash] = {};
        armors[item.itemHash].name = item.itemName;
        armors[item.itemHash].description = item.itemDescription;
        armors[item.itemHash].icon = '//www.bungie.net' + item.icon;
        armors[item.itemHash].subType = item.itemSubType;
        armors[item.itemHash].bucketTypeHash = item.bucketTypeHash
      }else if (item.bucketTypeHash === 4274335291) {
        emblems[item.itemHash] = item;
      }else {
        //console.log(row);
      }
    });

    var defsP = fs.createWriteStream('app/scripts/definitions/en/DestinyPrimaryWeaponDefinitions.js');
    defsP.write('var DestinyPrimaryWeaponDefinitions = ');
    defsP.write(JSON.stringify(primary));
    defsP.write(';');
    defsP.end();

    var defsS = fs.createWriteStream('app/scripts/definitions/en/DestinySpecialWeaponDefinitions.js');
    defsS.write('var DestinySpecialWeaponDefinitions = ');
    defsS.write(JSON.stringify(special));
    defsS.write(';');
    defsS.end();

    var defsH = fs.createWriteStream('app/scripts/definitions/en/DestinyHeavyWeaponDefinitions.js');
    defsH.write('var DestinyHeavyWeaponDefinitions = ');
    defsH.write(JSON.stringify(heavy));
    defsH.write(';');
    defsH.end();

    var defsA = fs.createWriteStream('app/scripts/definitions/en/DestinyArmorDefinition.js');
    defsA.write('var DestinyArmorDefinition = ');
    defsA.write(JSON.stringify(armors));
    defsA.write(';');
    defsA.end();

    var defsE = fs.createWriteStream('app/scripts/definitions/en/DestinyEmblemDefinitions.js');
    defsE.write('var DestinyEmblemDefinitions = ');
    defsE.write(JSON.stringify(emblems));
    defsE.write(';');
    defsE.end();
  });

  db.all('select * from DestinyTalentGridDefinition', function(err, rows) {
    if (err) {
      throw err;
    }

    items = {};
    nodes = {};

    rows.forEach(function(row) {
      var item = JSON.parse(row.json);
      items[item.gridHash] = item;
    });

    var defs = fs.createWriteStream('app/scripts/definitions/en/DestinyTalentGridDefinition.js');
    defs.write('var DestinyTalentGridDefinition =');
    defs.write(JSON.stringify(items));
  });
}

request
  .get('http://www.bungie.net/platform/Destiny/Manifest/', onManifestRequest);
