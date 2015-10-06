// Downloads DB dump from bungie manifest and creates our definition files
// Taken and modified from kyleshays DIM repo
// https://github.com/kyleshay/DIM/blob/master/build/processBungieManifest.js

var http = require('http');
var fs = require('fs');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var unzip = require('unzip');

function writeDefinitionFile(path, name, data) {
  var stream = fs.createWriteStream(path);
  stream.write('/* exported ' + name + ' */\n\n');
  stream.write('var ' + name + ' = ');
  stream.write(JSON.stringify(data, null, 2));
  stream.write(';');
  stream.end();
}

function onManifestRequest(error, response, body) {
  var parsedResponse = JSON.parse(body);
  version = parsedResponse.Response.version;

  ['en', 'de', 'es'].forEach(function(lang) {
    request
      .get('https://www.bungie.net' + parsedResponse.Response.mobileWorldContentPaths[lang])
      .pipe(fs.createWriteStream(lang + '-manifest.zip'))
      .on('close',function() {
        onManifestDownloaded(lang);
      });
  });
}

function onManifestDownloaded(lang) {
  fs.createReadStream(lang + '-manifest.zip')
    .pipe(unzip.Parse())
    .on('entry', function(entry) {
      ws = fs.createWriteStream('manifest/' + entry.path);

      ws.on('finish', function() {
        var exists = fs.existsSync('manifest/' + entry.path);

        if (exists) {
          extractDB('manifest/' + entry.path, lang);
        }
      });

      entry.pipe(ws);
    });
}

function extractDB(dbFile, lang) {
  db = new sqlite3.Database(dbFile);

  db.all('SELECT * FROM DestinyInventoryItemDefinition', function(err, rows) {
    if (err) throw err;

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

    writeDefinitionFile('app/scripts/definitions/'+ lang +'/DestinyArmorDefinition.js',    'DestinyArmorDefinition',    DestinyArmorDefinition);
    writeDefinitionFile('app/scripts/definitions/'+ lang +'/DestinySubclassDefinition.js', 'DestinySubclassDefinition', DestinySubclassDefinition);
    writeDefinitionFile('app/scripts/definitions/'+ lang +'/DestinyWeaponDefinition.js',   'DestinyWeaponDefinition',   DestinyWeaponDefinition);
  });

  db.all('SELECT * FROM DestinyHistoricalStatsDefinition', function(err, rows) {
    if (err) throw err;

    var DestinyMedalDefinition = {};

    rows.forEach(function(row) {
      var item = JSON.parse(row.json);

      // Medals
      if (item.statId.substring(0, 6) === 'medals') {
        DestinyMedalDefinition[item.statId] = {};
        DestinyMedalDefinition[item.statId].statName = item.statName;
        DestinyMedalDefinition[item.statId].statDescription = item.statDescription;
        DestinyMedalDefinition[item.statId].iconImage = item.iconImage;
      }
    });

    writeDefinitionFile('app/scripts/definitions/'+ lang +'/DestinyMedalDefinition.js', 'DestinyMedalDefinition', DestinyMedalDefinition);
  });

  db.all('SELECT * FROM DestinyActivityDefinition', function(err, rows) {
    if (err) throw err;

    var DestinyCrucibleMapDefinition = {};

    rows.forEach(function(row) {
      var item = JSON.parse(row.json);

      // Crucible Maps
      if ((item.activityTypeHash === 3695721985) && (item.activityName !== "") && (item.activityName !== "Rumble")) {
        DestinyCrucibleMapDefinition[item.activityHash] = {};
        DestinyCrucibleMapDefinition[item.activityHash].name = item.activityName;
        DestinyCrucibleMapDefinition[item.activityHash].pgcrImage = item.pgcrImage;

        var heatmapImage = '/images/heatmaps/' + item.activityName.replace(/'/g, '').replace(/ /g, '_').toLowerCase() + '.jpg';
        if (fs.existsSync('app' + heatmapImage)) {
          DestinyCrucibleMapDefinition[item.activityHash].heatmapImage = heatmapImage;
        }
      }
    });

    writeDefinitionFile('app/scripts/definitions/'+ lang +'/DestinyCrucibleMapDefinition.js', 'DestinyCrucibleMapDefinition', DestinyCrucibleMapDefinition);
  });
}

request.get('https://www.bungie.net/Platform/Destiny/Manifest/', onManifestRequest);
