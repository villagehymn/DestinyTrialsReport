'use strict';

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
    case BUCKET_HEAD:
      setDefinition(armors, 'head', armor);
      break;
    case BUCKET_ARMS:
      setDefinition(armors, 'arms', armor);
      break;
    case BUCKET_CHEST:
      setDefinition(armors, 'chest', armor);
      break;
    case BUCKET_LEGS:
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
              case STAT_INTELLECT:
                intellect += itemS.stats[s].value;
                break;
              case STAT_DISCIPLINE:
                discipline += itemS.stats[s].value;
                break;
              case STAT_STRENGTH:
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
