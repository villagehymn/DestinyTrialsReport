'use strict';

angular.module('trialsReportApp')
  .controller('PlayerCtrl', function ($scope, currentAccount, $analytics, playerCard) {

    if (!$scope.player.searched) {
      $scope.player.isTeammate = true;
      playerCard.getPlayerCard($scope.player).then(function (player) {
        $scope.player = player;
        playerCard.compareLastMatchResults($scope.player, $scope.fireteam[0].activities.lastThree)
      });
    }

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat,
        label: label
      });
    };

    function getAccountByName(name, platform) {
      if (angular.isUndefined(name)) {
        return;
      }
      var url = '/Platform/Destiny/SearchDestinyPlayer/' + platform + '/' + name + '/';
      return currentAccount.getAccount(url)
        .then(function (player) {
          sendAnalytic('searchedPlayer', 'name', name);
          sendAnalytic('searchedPlayer', 'platform', platform);
          playerCard.getPlayerCard(player).then(function (teammate) {
            $scope.$evalAsync( $scope.player = teammate );
          });
        });
    }

    $scope.searchPlayerbyName = function (name, platform) {
      if (angular.isDefined(name)) {
        getAccountByName(name, (platform ? 2 : 1));
        sendAnalytic('loadedPlayer', 'name', name);
        sendAnalytic('loadedPlayer', 'platform', (platform ? 2 : 1));
      }
    };

    $scope.getWeaponByHash = function (hash) {
      if ($scope.DestinyPrimaryWeaponDefinitions[hash]) {
        return $scope.DestinyPrimaryWeaponDefinitions[hash];
      } else if ($scope.DestinySpecialWeaponDefinitions[hash]) {
        return $scope.DestinySpecialWeaponDefinitions[hash];
      } else if ($scope.DestinyHeavyWeaponDefinitions[hash]) {
        return $scope.DestinyHeavyWeaponDefinitions[hash];
      }
    };


    $scope.setRecentPlayer = function (player) {
      var url = 'http://api.destinytrialsreport.com/SearchDestinyPlayer/' + player.membershipType + '/' + player.name;
      return currentAccount.getAccount(url)
        .then(function (player) {
          playerCard.getPlayerCard(player).then(function (teammate) {
            $scope.$evalAsync( $scope.player = teammate );
          });
        });
    };

    $scope.getWeaponTitle = function (title) {
      switch (title) {
        case 'weaponKillsGrenade': return 'Grenade';
        case 'weaponKillsMelee':   return 'Melee';
        case 'weaponKillsSuper':   return 'Super';
      }
    };

    $scope.toggleEdit = function (player) {
      $scope.suggestRecentPlayers();
      player.isEditing = !player.isEditing;
    };
  });
