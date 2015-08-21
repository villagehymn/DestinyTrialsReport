'use strict';

angular.module('trialsReportApp')
  .factory('inventoryStats', function ($http, weaponStats, armorStats, classStats, $q) {
    var getData = function (membershipType, membershipId, characterId) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/getInventory/' + membershipType + '/' + membershipId + '/' + characterId
      }).then(function (result) {
        return result.data;
      });
    };

    var getInventory = function (membershipType, player) {
      var setInventory = function (membershipType, player) {
          return getData(membershipType, player.membershipId, player.characterId)
            .then(function (inventory) {
              return inventory;
            });
        },
        parallelLoad = function (inventoryItems) {
          var methods = [
            weaponStats.getData(inventoryItems),
            armorStats.getData(inventoryItems),
            classStats.getData(inventoryItems)
          ];
          return $q.all(methods)
            .then($q.spread(function (weapons, armors, classItems) {
              player.background = classItems.bg;
              player.emblem = classItems.bg[1];
              player.weapons = weapons.weapons;
              player.armors = armors.armors;
              player.classNodes = classItems.classNodes;
              player.class = classItems.subClass;
              player.int = armors.int;
              player.dis = armors.dis;
              player.str = armors.str;
              player.cInt = armors.int > 270 ? 270 : armors.int;
              player.cDis = armors.dis > 270 ? 270 : armors.dis;
              player.cStr = armors.str > 270 ? 270 : armors.str;
              player.intPercent = +(100 * player.cInt / 270).toFixed();
              player.disPercent = +(100 * player.cDis / 270).toFixed();
              player.strPercent = +(100 * player.cStr / 270).toFixed();
              player.cTotal = player.cInt + player.cDis + player.cStr;
              player.cIntPercent = +(100 * player.cInt / player.cTotal).toFixed(2);
              player.cDisPercent = +(100 * player.cDis / player.cTotal).toFixed(2);
              player.cStrPercent = +(100 * player.cStr / player.cTotal).toFixed(2);

              if (classItems.blink && weapons.shotgun) {
                player.weapons.hazards.push('Blink Shotgun');
              }
              if (classItems.hasFusionGrenade && armors.hasStarfireProtocolPerk) {
                player.armors.hazards.push('Double Grenade');
              }
            })
          );
        },
        reportProblems = function (fault) {
          console.log(String(fault));
        };
      return setInventory(membershipType, player)
        .then(function(inventory) {
          parallelLoad(inventory);
          return player;
        })
        .catch(reportProblems);
    };

    return {
      getData: getData,
      getInventory: getInventory
    };
  });
