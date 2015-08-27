'use strict';

angular.module('trialsReportApp')
  .factory('playerCard', function ($http, currentAccount, inventoryStats, trialsStats, $q) {
    var getTeammate = function (player) {
      return currentAccount.getCharacters(player.membershipType, player.membershipId, player.name)
        .then(function (teammate) {
          teammate.fireTeam = player.fireTeam;
          teammate.mainPlayerLastThree = player.lastThree;
          return getPlayerCard(teammate);
        });
    };

    var teammatesFromUrl = function (mainPlayer, teammates) {
      var loadTeam = function (mainPlayer, teammates) {

        var methods = [];
        angular.forEach(teammates, function (player) {
          player.inUrl = true;
          player.mainPlayerLastThree = mainPlayer.lastThree;
          player.mainPlayerFireteam = mainPlayer.fireTeam;
          methods.push(getPlayerCard(player));
        });

        return $q.all(methods)
        },
        addTeamToPlayer = function (playerCards) {
          var dfd = $q.defer();
          dfd.resolve(playerCards);

          return dfd.promise;
        };

      return loadTeam(mainPlayer, teammates)
        .then(addTeamToPlayer)
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

        if (player.mainPlayerLastThree){
          var dfd = $q.defer();
          dfd.resolve(angular.forEach(player.lastThree, function (match, key) {
            if (player.mainPlayerLastThree[key]) {
              player.lastThree[key] = player.mainPlayerLastThree[key];
            } else {
              trialsStats.getPostGame(player.lastThree[key], player)
                .then(function (match) {
                  player.mainPlayerLastThree[key] = match;
                  player.lastThree[key] = match;
                });
            }
          }));
          methods.push(dfd.promise);
        } else {
          if (player.lastThree) {
            methods.push(trialsStats.getLastThree(player));
          }
        }

        return $q.all(methods)
      },
      setPlayerStats = function (result) {
        var dfd = $q.defer();
        var player = result[0], stats = result[1], postGame = result[2];
        if (postGame && !postGame.matchStats){
          postGame = trialsStats.getTeamSummary(postGame, player);
        }
        if (postGame && postGame.matchStats[player.id]) {
          player.allStats = postGame.matchStats[player.id].allStats;
          player.recentMatches = postGame.matchStats[player.id].recentMatches;
          player.abilityKills = postGame.matchStats[player.id].abilityKills;
          player.medals = postGame.matchStats[player.id].medals;
          player.weaponsUsed = postGame.matchStats[player.id].weaponsUsed;
          player.fireTeam = postGame.fireTeam;
        }
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
      getTeammate: getTeammate,
      refreshInventory: refreshInventory,
      teammatesFromUrl: teammatesFromUrl
    };
  });
