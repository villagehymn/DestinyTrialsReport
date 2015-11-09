'use strict';

angular.module('trialsReportApp')
  .factory('inventoryService', function (inventoryFactory, api, $q) {
    var getData = function (player) {
      return api.getInventory(
        player.membershipType,
        player.membershipId,
        player.characterInfo.characterId,
        '14',
        '21'
      )
      .then(function (result) {
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
          dfd.resolve(inventoryFactory.getData(inventoryItems));

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
