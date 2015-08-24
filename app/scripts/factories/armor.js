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

function setHazard(perkHash, items, hazardArray, name) {
  if (hazardArray.indexOf(perkHash) > -1) {
    items.hazards.push(name);
  }
}

function setDefinition(object, index, armor) {
  object[index] = {
    'definition': armor
  };
}

function setByBucketType(armor, armors) {
  switch (armor.bucketTypeHash) {
    case 3448274439:
      setDefinition(armors, 'head', armor);
      break;
    case 3551918588:
      setDefinition(armors, 'arms', armor);
      break;
    case 14239492:
      setDefinition(armors, 'chest', armor);
      break;
    case 20886954:
      setDefinition(armors, 'legs', armor);
      break;
  }
}

angular.module('trialsReportApp')
  .factory('armorStats', function () {
    var getData = function (items) {
      var armors = {};
      armors.hazards = [];
      var intellect = 0, discipline = 0,
        strength = 0, hasStarfireProtocolPerk = false;

      for (var n = 0; n < items.length; n++) {
        var itemS = items[n], armor = DestinyArmorDefinition[itemS.itemHash];

        if (armor) {
          for (var i = 0; i < itemS.perks.length; i++) {
            if (itemS.perks[i].isActive === true) {
              setHazard(itemS.perks[i].perkHash, armors, hazardQuickRevive, 'Quick Revive');
              setHazard(itemS.perks[i].perkHash, armors, hazardGrenadeOnSpawn, 'Grenade on Spawn');
              setHazard(itemS.perks[i].perkHash, armors, hazardDoubleGrenade, 'Double Grenade');
              hasStarfireProtocolPerk = (itemS.perks[i].perkHash === 3471016318);
            }
          }
          for (var s = 0; s < itemS.stats.length; s++) {
            switch (itemS.stats[s].statHash) {
              case 144602215:
                intellect += itemS.stats[s].value;
                break;
              case 1735777505:
                discipline += itemS.stats[s].value;
                break;
              case 4244567218:
                strength += itemS.stats[s].value;
                break;
            }
          }
          setByBucketType(armor, armors);
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
