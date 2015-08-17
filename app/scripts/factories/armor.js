'use strict';

var hazardQuickRevive = [
  40760096, // Light Beyond Nemesis (Warlock)
  2682002320, // Crest of Alpha Lupi (Titan)2272644374
  2272644374,
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

      for (var n = 0; n < items.length; n++) {
        var itemS = items[n];
        var aItem = DestinyArmorDefinition[itemS.itemHash];

        if (aItem) {
          for (var i = 0; i < itemS.perks.length; i++) {
            if (itemS.perks[i].isActive === true) {
              if (hazardQuickRevive.indexOf(itemS.perks[i].perkHash) > -1) {
                armors.hazards.push('Quick Revive');
              }
              if (hazardGrenadeOnSpawn.indexOf(itemS.perks[i].perkHash) > -1) {
                armors.hazards.push('Grenade on Spawn');
              }
              if (hazardDoubleGrenade.indexOf(itemS.perks[i].perkHash) > -1) {
                armors.hazards.push('Double Grenade');
              }
              if (itemS.perks[i].perkHash === 3471016318) {
                hasStarfireProtocolPerk = true;
              }
            }
          }
          for (var i = 0; i < itemS.stats.length; i++) {
            switch (itemS.stats[i].statHash) {
              case 144602215:
                intellect += itemS.stats[i].value;
                break;
              case 1735777505:
                discipline += itemS.stats[i].value;
                break;
              case 4244567218:
                strength += itemS.stats[i].value;
                break;
            }
          }

          switch (aItem.bucketTypeHash) {
            case 3448274439:
              armors.head = {
                'definition': aItem
              };
              break;
            case 3551918588:
              armors.arms = {
                'definition': aItem
              };
              break;
            case 14239492:
              armors.chest = {
                'definition': aItem
              };
              break;
            case 20886954:
              armors.legs = {
                'definition': aItem
              };
              break;
          }
        }
      }

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
