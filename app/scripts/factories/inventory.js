'use strict';

angular.module('trialsReportApp')
  .factory('inventoryStats', function ($http, weaponStats, armorStats, classStats) {
    var getData = function (membershipType, membershipId, characterId) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/getInventory/' + membershipType + '/' + membershipId + '/' + characterId
      }).then(function (result) {
        return result.data;
      });
    };

    var getInventory = function ($scope, membershipType, player, index, $q) {
      var setInventory = function (player) {
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
              $scope.fireteam[index].background = classItems.bg;
              $scope.fireteam[index].emblem = classItems.bg[1];
              $scope.fireteam[index].weapons = weapons.weapons;
              $scope.fireteam[index].armors = armors.armors;
              $scope.fireteam[index].classNodes = classItems.classNodes;
              $scope.fireteam[index].class = classItems.subClass;
              $scope.fireteam[index].int = armors.int;
              $scope.fireteam[index].dis = armors.dis;
              $scope.fireteam[index].str = armors.str;
              $scope.fireteam[index].cInt = armors.int > 270 ? 270 : armors.int;
              $scope.fireteam[index].cDis = armors.dis > 270 ? 270 : armors.dis;
              $scope.fireteam[index].cStr = armors.str > 270 ? 270 : armors.str;
              $scope.fireteam[index].intPercent = +(100 * $scope.fireteam[index].cInt / 270).toFixed();
              $scope.fireteam[index].disPercent = +(100 * $scope.fireteam[index].cDis / 270).toFixed();
              $scope.fireteam[index].strPercent = +(100 * $scope.fireteam[index].cStr / 270).toFixed();
              $scope.fireteam[index].cTotal = $scope.fireteam[index].cInt + $scope.fireteam[index].cDis + $scope.fireteam[index].cStr;
              $scope.fireteam[index].cIntPercent = +(100 * $scope.fireteam[index].cInt / $scope.fireteam[index].cTotal).toFixed(2);
              $scope.fireteam[index].cDisPercent = +(100 * $scope.fireteam[index].cDis / $scope.fireteam[index].cTotal).toFixed(2);
              $scope.fireteam[index].cStrPercent = +(100 * $scope.fireteam[index].cStr / $scope.fireteam[index].cTotal).toFixed(2);

              if (classItems.blink && weapons.shotgun) {
                $scope.fireteam[index].weapons.hazards.push('Blink Shotgun');
              }
              if (classItems.hasFusionGrenade && armors.hasStarfireProtocolPerk) {
                $scope.fireteam[index].armors.hazards.push('Double Grenade');
              }
            }));
        },
        reportProblems = function (fault) {
          console.log(String(fault));
        };
      setInventory(player)
        .then(parallelLoad)
        .catch(reportProblems);
    };

    return {
      getData: getData,
      getInventory: getInventory
    };
  });
