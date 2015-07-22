'use strict';

angular.module('trialsReportApp')
  .factory('inventoryStats', function($http, requestUrl, weaponStats, armorStats, classStats) {
    var path = requestUrl.url;
    var getData = function(membershipType, membershipId, characterId) {
      return $http({method:'GET', url: path + 'Destiny/' + membershipType + '/Account/' + membershipId  + '/Character/' + characterId + '/Inventory/?definitions=true'}).then(function(result){
        return result.data.Response;
      });
    };

    var getInventory = function($scope, membershipType, membershipId, characterId, index, $q, $log)
    {
      var setInventory = function( membershipType, membershipId, characterId )
        {
          return getData( membershipType, membershipId, characterId )
            .then( function( inventory )
            {
              var items = inventory.data.buckets.Equippable;
              var talentGrid = inventory.definitions.talentGrids;
              var definitionItems = inventory.definitions.items;
              return {items: items, talentGrid: talentGrid, definitionItems: definitionItems};
            });
        },
        parallelLoad = function ( inventoryItems )
        {
          var methods = [
            weaponStats.getData(inventoryItems.items, inventoryItems.talentGrid),
            armorStats.getData(inventoryItems.items),
            classStats.getData(inventoryItems.items, inventoryItems.talentGrid, inventoryItems.definitionItems)
          ];
          return $q.all(methods)
            .then( $q.spread( function( weapons, armors, classItems )
            {
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
              $scope.fireteam[index].intPercent = Math.round(($scope.fireteam[index].cInt / 270) * 100);
              $scope.fireteam[index].disPercent = Math.round(($scope.fireteam[index].cDis / 270) * 100);
              $scope.fireteam[index].strPercent = Math.round(($scope.fireteam[index].cStr / 270) * 100);
              $scope.fireteam[index].cTotal = $scope.fireteam[index].cInt + $scope.fireteam[index].cDis + $scope.fireteam[index].cStr;
              $scope.fireteam[index].cIntPercent = ($scope.fireteam[index].cInt / $scope.fireteam[index].cTotal) * 100;
              $scope.fireteam[index].cDisPercent = ($scope.fireteam[index].cDis / $scope.fireteam[index].cTotal) * 100;
              $scope.fireteam[index].cStrPercent = ($scope.fireteam[index].cStr / $scope.fireteam[index].cTotal) * 100;
              if (classItems.blink && weapons.shotgun) {
                $scope.fireteam[index].weapons.hazards.push('Blink Shotgun');
              }
              if (classItems.hasFusionGrenade && armors.hasStarfireProtocolPerk) {
                $scope.fireteam[index].armors.hazards.push('Double Grenade');
              }
            })
          );
        },
        reportProblems = function( fault )
        {
          $log.error( String(fault) );
        };
      setInventory( membershipType, membershipId, characterId)
        .then( parallelLoad )
        .catch( reportProblems );
    };

    return {getData: getData, getInventory: getInventory};
  });
