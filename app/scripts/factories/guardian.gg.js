'use strict';

angular.module('trialsReportApp')
  .factory('guardianFactory', function ($filter, guardianGG) {

    var getElo = function (player) {
      return guardianGG.getElo(player.membershipId)
        .then(function (elo) {
          var elo = _.find(elo.data, function(arr){ return arr.mode == 14; });
          if (elo) {
            player.elo = elo.elo
          }
          return player;
        }).catch(function () {});
    };

    var getWeapons = function (platform) {
      var friday = new Date();
      var dateBeginTrials = $filter('date')(friday.setDate(friday.getDate() - friday.getDay() + 5),'yyyy-MM-dd');
      return guardianGG.getWeapons(platform, dateBeginTrials)
        .then(function (weapons) {
          return {
            gggWeapons: weapons.data,
            dateBeginTrials: dateBeginTrials
          };
        }).catch(function () {});
    };

    var getFireteam = function (mode, membershipId) {
      return guardianGG.getFireteam(mode, membershipId)
        .then(function (result) {
          return result;
        }).catch(function () {});
    };

    return {
      getElo: getElo,
      getWeapons: getWeapons,
      getFireteam: getFireteam
    };
  });
