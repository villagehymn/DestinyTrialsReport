'use strict';

angular.module('trialsReportApp')
  .factory('statsFactory', function ($http, bungie, api) {

    var getStats = function (player) {
      return bungie.getStats(
        player.membershipType,
        player.membershipId,
        player.characterInfo.characterId,
        '14'
      ).then(function (result) {
          var stats;
          if(!angular.isUndefined(result.data.Response)) {
            stats = result.data.Response.trialsOfOsiris.allTime;
            if (stats) {
              stats.activitiesWinPercentage = {
                'basic': {'value': +(100 * stats.activitiesWon.basic.value / stats.activitiesEntered.basic.value).toFixed()},
                'statId': 'activitiesWinPercentage'
              };
              stats.activitiesWinPercentage.basic.displayValue = stats.activitiesWinPercentage.basic.value + '%';
            }
          }
          player.stats = stats;
          return player;
        });
    };

    var getGrimoire = function (player) {
      return bungie.getGrimoire(
        player.membershipType,
        player.membershipId,
        '110012'
      ).then(function (result) {
          var lighthouse;
          if(!angular.isUndefined(result.data.Response)) {
            lighthouse = result.data.Response.data.cardCollection.length > 0;
          }
          player.lighthouse = lighthouse;
          return player;
        });
    };

    var getLighthouseCount = function (player) {
      return api.lighthouseCount(
        player.membershipId
      ).then(function (result) {
          if (result && result.data && result.data[0] && result.data[0].count) {
            player.lighthouseCount = result.data[0].count;
            return player;
          }
        });
    };

    var getTopWeapons = function (player) {
      return api.topWeapons(
        player.membershipId
      ).then(function (result) {
          if (result && result.data) {
            var topWeapons = {};
            _.each(result.data, function(weapon) {
              topWeapons[weapon.weaponId] = {percision: +(100 * weapon.headshots / weapon.kills).toFixed()};
            });
            player.topWeapons = topWeapons;
            return player;
          }
        });
    };

    var getPreviousMatches = function (player) {
      return api.previousMatches(
        player.membershipId
      ).then(function (result) {
          if (result && result.data) {
            return result.data;
          }
        });
    };

    var checkSupporter = function (player) {
      return api.checkSupporterStatus(
        player.membershipId
      ).then(function (result) {
          var nonHazard;
          if(!angular.isUndefined(result.data)) {
            nonHazard = result.data;
          }
          player.nonHazard = nonHazard;
          return player;
        });
    };

    return {
      getStats: getStats,
      getGrimoire: getGrimoire,
      checkSupporter: checkSupporter,
      getLighthouseCount: getLighthouseCount,
      getTopWeapons: getTopWeapons,
      getPreviousMatches: getPreviousMatches
    };
  });
