'use strict';

var hazardQuickRevive = [
  40760096, // Light Beyond Nemesis (Warlock)
  2682002320, // Crest of Alpha Lupi (Titan)
  3821972036 // Crest of Alpha Lupi (Hunter)
];
var hazardGrenadeOnSpawn = [
  2289894117, // Lucky Raspberry (Hunter)
  2671461052 // Voidfang Vestments (Warlock)
];
var hazardDoubleGrenade = [
  2978872641 // The Armamentarium (Titan)
];

angular.module('trialsReportApp')
  .factory('armorStats', function () {
    var getData = function (items) {
      var armors = {};
      armors.hazards = [];
      var intellect = 0;
      var discipline = 0;
      var strength = 0;
      var hasStarfireProtocolPerk = false;

      angular.forEach(items, function (item) {
        var itemS = item.items[0];
        var aItem = DestinyArmorDefinition[itemS.itemHash];

        if (aItem) {
          angular.forEach(itemS.perks, function (perk) {
            if (perk.isActive === true) {
              if (hazardQuickRevive.indexOf(perk.perkHash) > -1) {
                armors.hazards.push('Quick Revive');
              }
              if (hazardGrenadeOnSpawn.indexOf(perk.perkHash) > -1) {
                armors.hazards.push('Grenade on Spawn');
              }
              if (hazardDoubleGrenade.indexOf(perk.perkHash) > -1) {
                armors.hazards.push('Double Grenade');
              }
              if (perk.perkHash === 3471016318) {
                hasStarfireProtocolPerk = true;
              }
            }
          });
          angular.forEach(itemS.stats, function (stat) {
            switch (stat.statHash) {
            case 144602215:
              intellect += stat.value;
              break;
            case 1735777505:
              discipline += stat.value;
              break;
            case 4244567218:
              strength += stat.value;
              break;
            }
          });

          switch (aItem.bucketTypeHash) {
          case 3448274439:
            armors.head = {
              'armor': aItem
            };
            break;
          case 3551918588:
            armors.arms = {
              'armor': aItem
            };
            break;
          case 14239492:
            armors.chest = {
              'armor': aItem
            };
            break;
          case 20886954:
            armors.legs = {
              'armor': aItem
            };
            break;
          }
        }
      });

      return {
        armors: armors,
        int: intellect,
        dis: discipline,
        str: strength,
        hasStarfireProtocolPerk: hasStarfireProtocolPerk
      };
    };

    return {
      getData: getData
    };
  });
