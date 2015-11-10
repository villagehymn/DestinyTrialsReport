'use strict';

angular.module('trialsReportApp')
  .factory('statsFactory', function ($http, api) {

    var getstats = function (player) {
      return api.trialsStats(
        player.membershipType,
        player.membershipId,
        player.characterInfo.characterId
      ).then(function (result) {
        if(!angular.isUndefined(result.data.stats)) {
          result.data.stats.activitiesWinPercentage = {
            'basic': {'value': +(100 * result.data.stats.activitiesWon.basic.value / result.data.stats.activitiesEntered.basic.value).toFixed()},
            'statId': 'activitiesWinPercentage'
          };
          result.data.stats.activitiesWinPercentage.basic.displayValue = result.data.stats.activitiesWinPercentage.basic.value + '%';
        }
        player.stats = result.data.stats;
        player.nonHazard = result.data.nonHazard;
        player.lighthouse = result.data.lighthouse;
        return player;
      });
    };

    return {
      getstats: getstats
    };
  });
