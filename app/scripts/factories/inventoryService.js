'use strict';

angular.module('trialsReportApp')
  .factory('inventoryService', function ($http, inventoryStats, $q) {
    var getData = function (player) {
      return $http({
        method: 'GET',
        url: '/api/getInventory/' + player.membershipType + '/' + player.membershipId + '/' + player.characterInfo.characterId
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
          var dfd = $q.defer();
          dfd.resolve(inventoryStats.getData(inventoryItems));

          return dfd.promise;
        },
        setPlayerInventory = function (inventory) {
          var dfd = $q.defer();
          player.setInventory(player, inventory);
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
