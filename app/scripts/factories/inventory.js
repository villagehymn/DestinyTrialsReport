'use strict';

angular.module('trialsReportApp')
  .factory('inventoryStats', function($http, requestUrl, weaponStats, armorStats, classStats) {
    var path = requestUrl.url;
    var getData = function(membershipType, membershipId, characterId) {
      return $http({method:"GET", url: path + 'Destiny/' + membershipType + '/Account/' + membershipId  + '/Character/' + characterId + '/Inventory/?definitions=true'}).then(function(result){
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
              if (classItems.blink && weapons.shotgun){
                $scope.fireteam[index].weapons.hazards.push('Blink Shotgun');
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

    return { getData: getData, getInventory: getInventory };
  });
