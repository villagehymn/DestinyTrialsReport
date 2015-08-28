'use strict';

angular.module('trialsReportApp')
  .factory('playerCard', function ($http, currentAccount, inventoryStats, trialsStats, $q) {

    var compareLastMatchResults = function (player, postGameResults) {
      var getTeammateCharacters = function (player) {
          var dfd = $q.defer();
          dfd.resolve(currentAccount.getCharacters(player.membershipType, player.membershipId, player.name));
          return dfd.promise;
        },
        getTeammateActivities = function (teammate) {
          var dfd = $q.defer();
          dfd.resolve(currentAccount.getActivities(teammate, 25));
          return dfd.promise;
        },
        updateLastMatchResults = function (teammate) {
          teammate.isTeammate = true;
          var lastThree = {};
          angular.forEach(teammate.lastThree, function (match, key) {
              if (postGameResults[key]) {
                lastThree[key] = postGameResults[key];
              } else {
                lastThree[key] = trialsStats.getPostGame(teammate.lastThree[key], teammate);
              }
            });
          return $q.all(lastThree).then(function (result) {
            teammate.lastThree = result;
            return teammate;
          });
        };

      return getTeammateCharacters(player)
        .then(getTeammateActivities)
        .then(updateLastMatchResults)
        .catch(reportProblems);
    };

    var setPlayerCard = function (player) {
        var count = player.myProfile ? 250 : 25;
        return currentAccount.getActivities(player, count)
          .then(function (player) {
            return player;
          });
      },
      playerStatsInParallel = function (player) {

        var methods = [
          inventoryStats.getInventory(player.membershipType, player),
          trialsStats.getData(player)
        ];

        if (player.lastThree && !player.isTeammate) {
          methods.push(trialsStats.getLastThree(player));
        }

        return $q.all(methods)
      },
      setPlayerStats = function (result) {
        var dfd = $q.defer();
        var player = result[0], stats = result[1], postGame = result[2];
        if (player.isTeammate) {
          postGame = trialsStats.getTeamSummary(player.lastThree, player);
        }
        if (postGame && postGame.matchStats[player.id]) {
          player.allStats = postGame.matchStats[player.id].allStats;
          player.recentMatches = postGame.matchStats[player.id].recentMatches;
          player.abilityKills = postGame.matchStats[player.id].abilityKills;
          player.medals = postGame.matchStats[player.id].medals;
          player.weaponsUsed = postGame.matchStats[player.id].weaponsUsed;
          player.fireTeam = postGame.fireTeam;
        }
        player.noRecentMatches = !player.recentMatches;
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
      getPlayerCard: getPlayerCard,
      refreshInventory: refreshInventory,
      compareLastMatchResults: compareLastMatchResults
    };
  });
