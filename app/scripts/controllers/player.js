'use strict';

angular.module('trialsReportApp')
  .controller('PlayerCtrl', function ($scope, api, trialsStats, trialsReport, $analytics, guardianFactory) {

    trialsReport.getActivities($scope.player, '25');
    guardianFactory.getElo($scope.player);
    trialsStats.getData($scope.player);

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat,
        label: label
      });
    };

    $scope.getLastMatch = function (player) {
      return trialsStats.getLastThree(player)
        .then(function (postGame) {
          var playerId = player.membershipId;
          if (postGame && postGame.matchStats[playerId]) {
            player.allStats = postGame.matchStats[playerId].allStats;
            player.recentMatches = postGame.matchStats[playerId].recentMatches;
            player.abilityKills = postGame.matchStats[playerId].abilityKills;
            player.medals = postGame.matchStats[playerId].medals;
            player.weaponsUsed = postGame.matchStats[playerId].weaponsUsed;
            player.fireTeam = postGame.fireTeam;
          }
        });
    };

    $scope.getWeaponByHash = function (hash) {
      if ($scope.DestinyWeaponDefinition[hash]) {
        var definition = $scope.DestinyWeaponDefinition[hash];
        if (definition.icon.substr(0, 4) !== 'http') {
          definition.icon = 'https://www.bungie.net' + definition.icon;
        }
        return definition;
      }
    };

    $scope.getWeaponTitle = function (title) {
      switch (title) {
        case 'weaponKillsGrenade': return 'Grenade';
        case 'weaponKillsMelee':   return 'Melee';
        case 'weaponKillsSuper':   return 'Super';
      }
    };
  });
