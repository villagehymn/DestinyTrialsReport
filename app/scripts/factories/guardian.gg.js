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
            player.ggg = playerElo;
            player.ggg.tier = getGggTierByElo(player.ggg.elo);
            if (player.ggg.rank > 0) {
              player.ggg.rank = '#' + $filter('number')(player.ggg.rank);
            } else if (player.ggg.rank == -1) {
              player.ggg.rank = 'Placing';
            } else if (player.ggg.rank == -2) {
              player.ggg.rank = 'Inactive';
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
      var now = moment.utc();
      var begin = now.clone().hour(18).minute(0).second(0);
      if (now.day() !== 5) {
        begin.day(-2);
      } else {
        if (now < begin) {
          begin.subtract(1, 'week');
        }
      }
      var end = begin.clone().add(4, 'days').hour(9);

      var dateBeginTrials = begin.format('YYYY-MM-DD');
      var dateEndTrials = end.format('YYYY-MM-DD');

      return guardianGG.getWeapons(platform, dateBeginTrials, dateEndTrials)
        .then(function (weapons) {
          var show = false;
          if (angular.isDefined(weapons.data)) {
            if (angular.isDefined(weapons.data.primary) && angular.isDefined(weapons.data.special) && angular.isDefined(weapons.data.heavy)) {
              if (weapons.data.primary.length > 0 && weapons.data.special.length > 0 && weapons.data.heavy.length > 0) {
                show = true;
              }
            }
          }
          
          return {
            gggWeapons: weapons.data,
            dateBeginTrials: dateBeginTrials,
            dateEndTrials: dateEndTrials,
            show: show
          };
        }).catch(function () {});
    };

    return {
      getElo: getElo,
      getFireteam: getFireteam,
      getWeapons: getWeapons
    };
  });
