'use strict';

angular.module('trialsReportApp')
  .factory('guardianggFactory', function ($filter, guardianGG) {

    var getElo = function (fireteam) {
      return guardianGG.getTeamElo([fireteam[0].membershipId, fireteam[1].membershipId, fireteam[2].membershipId])
        .then(function (elo) {
          return elo.data;
          //var playerElo = _.find(elo.data, function (arr) {
          //  return arr.mode === 14;
          //});
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
      var begin = now.clone().day(5).hour(18).minute(0).second(0).millisecond(0);
      if (now.isBefore(begin)) begin.subtract(1, 'week');
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
