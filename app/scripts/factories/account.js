'use strict';

function setPlayerLastMatches(postGame, player) {
  var playerId = player.membershipId;
  if (postGame && postGame.matchStats[playerId]) {
    player.allStats = postGame.matchStats[playerId].allStats;
    player.recentMatches = postGame.matchStats[playerId].recentMatches;
    player.abilityKills = postGame.matchStats[playerId].abilityKills;
    player.medals = postGame.matchStats[playerId].medals;
    player.weaponsUsed = postGame.matchStats[playerId].weaponsUsed;
    player.fireTeam = postGame.fireTeam;
  }
}

angular.module('trialsReportApp')
  .factory('currentAccount', function ($http, $filter, toastr, Player, inventoryService, trialsStats, $q) {
    var getAccount = function (url) {
      return $http({
        method: 'GET',
        url: url
      }).then(function (resultAcc) {
        if (resultAcc.data.Response.length < 1) {
          toastr.error('Player not found', 'Error');
          return;
        }
        var response = resultAcc.data.Response[0];
        return getCharacters(response.membershipType, response.membershipId, response.displayName);
      }).catch(function () {});
    };

    var getCharacters = function (membershipType, membershipId, name) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/' + membershipType + '/Account/' + membershipId + '/'
      }).then(function (resultChar) {
        var player = Player.build(resultChar.data.Response.data, name, resultChar.data.Response.data.characters[0]);
        return player;
      }).catch(function () {});
    };

    var getActivities = function (account, count) {
      var aCount = count > 0 ? '&count='+ count : '&count=25';
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + account.characterInfo.characterId + '/?mode=14' + aCount
      }).then(function (resultAct) {
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          toastr.error('No Trials matches found for player', 'Error');
          return account;
        }
        return account.setActivities(account, activities);
      }).catch(function () {});
    };

    var getLastTwentyOne = function (account, character) {
      var allPastActivities = [];
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + character.characterInfo.characterId + '/?mode=14&count=21'
      }).then(function (resultAct) {
        var activities = resultAct.data.Response.data.activities;
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
        return allPastActivities;
      }).catch(function () {});
    };

    var compareLastMatchResults = function (player, postGameResults) {
      var updateLastMatchResults = function (teammate) {
          teammate.isTeammate = true;
          var lastThree = {};
          angular.forEach(teammate.activities.lastThree, function (match, key) {
            if (postGameResults[key]) {
              lastThree[key] = postGameResults[key];
            } else {
              lastThree[key] = trialsStats.getPostGame(teammate.activities.lastThree[key], teammate);
            }
          });
          return $q.all(lastThree).then(function (result) {
            teammate.activities.lastThree = result;
            return teammate;
          });
        },
        updateMatchStats = function (player) {
          var dfd = $q.defer();
          dfd.resolve(trialsStats.getTeamSummary(player.activities.lastThree, player));

          return dfd.promise.then(function (postGame) {
            setPlayerLastMatches(postGame, player);
          });
        };

      return updateLastMatchResults(player, postGameResults)
        .then(updateMatchStats)
        .catch(reportProblems);
    };

    var setPlayerCard = function (player) {
        var count = player.myProfile ? 250 : 25;
        return getActivities(player, count)
          .then(function (player) {
            return player;
          });
      },
      playerStatsInParallel = function (player) {
        var methods = [
          inventoryService.getInventory(player.membershipType, player),
          trialsStats.getData(player)
        ];

        if (player.activities && player.activities.lastThree && !player.isTeammate) {
          methods.push(trialsStats.getLastThree(player));
        }

        return $q.all(methods);
      },
      setPlayerStats = function (result) {
        var dfd = $q.defer();
        var player = result[0], stats = result[1], postGame = result[2];
        setPlayerLastMatches(postGame, player);
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

    var getPlayerCard = function (player) {
      return setPlayerCard(player)
        .then(playerStatsInParallel)
        .then(setPlayerStats)
        .catch(reportProblems);
    };

    var refreshInventory = function (player) {
      return playerStatsInParallel(player)
        .then(setPlayerStats)
        .catch(reportProblems);
    };

    return {
      getAccount: getAccount,
      getActivities: getActivities,
      getLastTwentyOne: getLastTwentyOne,
      getCharacters: getCharacters,
      getPlayerCard: getPlayerCard,
      refreshInventory: refreshInventory,
      compareLastMatchResults: compareLastMatchResults
    };
  });
