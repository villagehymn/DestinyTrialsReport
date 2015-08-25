'use strict';

angular.module('trialsReportApp')
  .factory('playerCard', function ($http, currentAccount, inventoryStats, trialsStats, $q) {
    var getTeammate = function (player) {
      return currentAccount.getCharacters(player.membershipType, player.membershipId, player.name)
        .then(function (teammate) {
          teammate.fireTeam = player.fireTeam;
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
          .then($q.spread(function (playerTwo, playerThree) {
            mainPlayer.teamFromParams = [playerTwo, playerThree];
          }));
      };

      return loadTeam(mainPlayer, teammates)
        .then(function() {
          return mainPlayer;
        })
        .catch(reportProblems);
    };

    var setPlayerCard = function (player) {
        var count = player.myProfile ? 250 : 25;
        return currentAccount.getActivities(player, count)
          .then(function (player) {
            return player;
          });
      },
      parallelLoad = function (player) {

        var methods = [
          inventoryStats.getInventory(player.membershipType, player),
          trialsStats.getData(player)
        ];

        if (player.mainPlayerLastThree){
          angular.forEach(player.lastThree, function (match, key) {
            if (player.mainPlayerLastThree[key]) {
              player.lastThree[key] = player.mainPlayerLastThree[key];
            } else {
              return trialsStats.getPostGame(player.lastThree[key])
                .then(function (match) {
                  player.lastThree[key] = match;
                });
            }
            trialsStats.getTeamSummary(player.lastThree, player);
          });
        } else {
          methods.push(trialsStats.getLastFive(player));
        }

        return $q.all(methods)
          .then($q.spread(function (player, stats, postGame) {
            player.fireTeam = postGame.fireTeam;
            player.stats = stats.stats;
            player.nonHazard = stats.nonHazard;
            player.lighthouse = stats.lighthouse;
          }));
      },
      reportProblems = function (fault) {
        console.log(String(fault));
      };

    var getPlayerCard = function (player) {
      return setPlayerCard(player)
        .then(function(player) {
          return refreshInventory(player).then(function() {
            return player;
          });
        })
        .catch(reportProblems);
    };

    var refreshInventory = function (player) {
      return parallelLoad(player)
        .then(function() {
          return player;
        })
        .catch(reportProblems);
    };


    return {
      getPlayerCard: getPlayerCard,
      getTeammate: getTeammate,
      refreshInventory: refreshInventory,
      teammatesFromUrl: teammatesFromUrl
    };
  });
