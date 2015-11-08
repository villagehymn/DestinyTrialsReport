'use strict';

angular.module('trialsReportApp')
  .factory('currentAccount', function (Player, inventoryService, trialsStats, $q, bungie) {

    var getLastTwentyOne = function (account) {
      var allPastActivities = [];
      var methods = [];
      angular.forEach(account.characters, function (character) {
        methods.push(
          bungie.getActivityHistory(
            character.membershipType,
            character.membershipId,
            character.characterInfo.characterId,
            '14',
            '21'
          )
        );
      });
      return $q.all(methods)
        .then(function(results) {
          angular.forEach(results, function (result) {
            var activities = result.data.Response.data.activities;
            if (angular.isUndefined(activities)) {
              return;
            }
            angular.forEach(activities.slice().reverse(), function (activity, index) {
              if (index % 5 === 0) {
                allPastActivities.push({
                  'id': activity.activityDetails.instanceId,
                  'standing': activity.values.standing.basic.value
                });
              }
            });
          });
          return allPastActivities;
        });
    };

    var playerStatsInParallel = function (player) {
        var methods = [
          inventoryService.getInventory(player.membershipType, player),
          trialsStats.getData(player)
        ];

        return $q.all(methods);
      },
      setPlayerStats = function (result) {
        var dfd = $q.defer();
        var player = result[0], stats = result[1];
        player.noRecentMatches = !player.activities || !player.activities.lastTwentyFive;
        player.stats = stats.stats;
        player.nonHazard = stats.nonHazard;
        player.lighthouse = stats.lighthouse;
        dfd.resolve(player);

        return dfd.promise;
      },
      reportProblems = function (fault) {
        console.log(String(fault));
      };


    var refreshInventory = function (player) {
      return playerStatsInParallel(player)
        .then(setPlayerStats)
        .catch(reportProblems);
    };

    var getFireteamFromActivitiy = function (recentActivity, id) {
      return bungie.getPgcr(recentActivity.id)
        .then(function (resultPostAct) {
          var fireTeam = {};
          var data = resultPostAct.data.Response.data;
          var entries = data.entries, standing = recentActivity.standing;
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].standing === standing) {
              var playerId = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);

              if (playerId !== angular.lowercase(id)) {
                var teammateId = angular.lowercase(entries[i].player.destinyUserInfo.membershipId);
                fireTeam[teammateId] = Player.build(entries[i].player.destinyUserInfo, entries[i].player.destinyUserInfo.displayName, entries[i]);
              }
            }
          }
          return fireTeam;
        });
    };

    return {
      getLastTwentyOne: getLastTwentyOne,
      refreshInventory: refreshInventory,
      getFireteamFromActivitiy: getFireteamFromActivitiy
    };
  });
