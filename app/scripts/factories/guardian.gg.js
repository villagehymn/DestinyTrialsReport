'use strict';

angular.module('trialsReportApp')
  .factory('guardianFactory', function ($filter, guardianGG) {

    var getElo = function (player) {
      return guardianGG.getElo(player.membershipId)
        .then(function (elo) {
          var playerElo = _.find(elo.data, function(arr){ return arr.mode === 14; });
          if (playerElo) {
            player.elo = playerElo.elo;
          }
          return player;
        }).catch(function () {});
    };

    var getWeapons = function (platform) {
      var dateFriday;
      var dateBeginTrials;
      if (moment().day() < 5) {
        dateFriday = moment().day(- (moment().day() + 2));
      } else {
        dateFriday = moment().startOf('week').add(5, 'days');
      }
      dateBeginTrials = dateFriday.format('YYYY-MM-DD');
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
