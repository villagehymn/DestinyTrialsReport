'use strict';

angular.module('trialsReportApp')
  .factory('inventoryStats', function ($http, weaponStats, armorStats, classStats, $q) {
    var getData = function (player) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/getInventory/' + player.membershipType + '/' + player.membershipId + '/' + player.characterInfo.characterId
      }).then(function (result) {
        return result.data;
      });
    };

    var getInventory = function (membershipType, player) {
      var returnInventory = function (membershipType, player) {
          var dfd = $q.defer();
          dfd.resolve(getData(player));

          return dfd.promise;
        },
        inventoryInParallel = function (inventoryItems) {
          var methods = [
            weaponStats.getData(inventoryItems),
            armorStats.getData(inventoryItems),
            classStats.getData(inventoryItems)
          ];
          return $q.all(methods);
        },
        setPlayerInventory = function (results) {
          var dfd = $q.defer();
          player.setInventory(player, results[0], results[1], results[2]);
          dfd.resolve(player);
          return dfd.promise;
        },
        reportProblems = function (fault) {
          console.log(String(fault));
        };
      return returnInventory(membershipType, player)
        .then(inventoryInParallel)
        .then(setPlayerInventory)
        .catch(reportProblems);
    };

    return {
      getData: getData,
      getInventory: getInventory
    };
  });
