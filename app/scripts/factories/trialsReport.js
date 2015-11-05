'use strict';

angular.module('trialsReportApp')
  .factory('trialsReport', function (toastr, Player, bungie, api) {
    var getAccount = function (platform, name) {
      return api.searchForPlayer(
        platform,
        name
      ).then(function(result) {
          if (result.data.Response.length < 1) {
            toastr.error('Player not found', 'Error');
            return;
          }
          var response = result.data.Response[0];
          return getCharacters(response.membershipType, response.membershipId, response.displayName);
        });
    };

    var getCharacters = function (membershipType, membershipId, name) {
      return bungie.getAccount(
        membershipType,
        membershipId
      ).then(function (resultChar) {
        if (resultChar.data.Response) {
          return Player.build(
            resultChar.data.Response.data,
            name,
            resultChar.data.Response.data.characters[0]);
        } else {
          toastr.error('Player not found', 'Error');
        }
      }).catch(function () {});
    };

    var getRecentActivity = function (account) {
      return bungie.getActivityHistory(
        account.membershipType,
        account.membershipId,
        account.characterInfo.characterId,
        '14',
        '1'
      ).then(function(result) {
          var activities = result.data.Response.data.activities;
          if (angular.isUndefined(activities)) {
            toastr.error('No Trials matches found for player', 'Error');
            return account;
          }
          activities.displayName = account.name;
          return activities;
        });
    };

    var getActivities = function (account, count) {
      var aCount = count > 0 ? count : '25';
      return bungie.getActivityHistory(
        account.membershipType,
        account.membershipId,
        account.characterInfo.characterId,
        '14',
        aCount
      ).then(function(result) {
          var activities = result.data.Response.data.activities;
          if (angular.isUndefined(activities)) {
            toastr.error('No Trials matches found for player', 'Error');
            return account;
          }
          return setActivityData(account, activities);
        });
    };

    function setActivityData(account, activities) {
      var lastThree = {},
        reversedAct = activities.slice().reverse(),
        mapStats = {},
        pastActivities = [],
        streak = 0,
        totals = {
          kills: 0,
          deaths: 0,
          assists: 0,
          wins: 0,
          losses: 0
        };
      var recentActivity = {
        'id': activities[0].activityDetails.instanceId,
        'standing': activities[0].values.standing.basic.value
      };
      streak = setMapReturnStreak(reversedAct, pastActivities, streak, recentActivity, mapStats, totals);
      setLastThreeMatches(lastThree, activities);
      account.activities = {
        lastTwentyFive: pastActivities,
        recentActivity: recentActivity,
        streak: streak,
        lastThree: lastThree,
        mapStats: mapStats,
        totals: totals
      };

      return account
    }

    return {
      getAccount: getAccount,
      getRecentActivity: getRecentActivity,
      getCharacters: getCharacters,
      getActivities: getActivities
    };
  });
