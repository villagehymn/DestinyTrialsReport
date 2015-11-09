'use strict';

var getGggTierByElo = function (elo) {
  if (elo < 1100) return 'Bronze';
  if (elo < 1300) return 'Silver';
  if (elo < 1500) return 'Gold';
  if (elo < 1700) return 'Platinum';
  return 'Diamond';
};

angular.module('trialsReportApp')
  .factory('guardianFactory', function ($filter, guardianGG) {

    var getElo = function (player) {
      return guardianGG.getElo(player.membershipId)
        .then(function (elo) {
          var playerElo = _.find(elo.data, function (arr) {
            return arr.mode === 14;
          });
          if (playerElo) {
            player.elo = playerElo;
            player.elo.tier = getGggTierByElo(player.elo.elo);
            if (player.elo.rank > -1) {
              player.elo.rank = '#' + $filter('number')(player.elo.rank + 1);
            } else {
              player.elo.rank = 'Placing';
            }
          }
          return player;
        }).catch(function () {});
    };

    var getFireteam = function (mode, membershipId) {
      return guardianGG.getFireteam(mode, membershipId)
        .then(function (result) {
          return result;
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

    return {
      getElo: getElo,
      getFireteam: getFireteam,
      getWeapons: getWeapons
    };
  });
