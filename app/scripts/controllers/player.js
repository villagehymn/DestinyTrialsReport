'use strict';

angular.module('trialsReportApp')
  .controller('PlayerCtrl', function ($scope, currentAccount, $analytics, locationChanger) {

    if (!$scope.player.searched && !$scope.player.invalidResult) {
      $scope.player.isTeammate = true;
      currentAccount.getPlayerCard($scope.player).then(function (player) {
        $scope.player = player;
        currentAccount.compareLastMatchResults($scope.player, $scope.fireteam[0].activities.lastThree)
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
          currentAccount.getPlayerCard(player).then(function (teammate) {
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
      if ($scope.DestinyWeaponDefinition[hash]) {
        return $scope.DestinyWeaponDefinition[hash];
      }
    };

    $scope.setRecentPlayer = function (player) {
      var url = 'http://api.destinytrialsreport.com/SearchDestinyPlayer/' + player.membershipType + '/' + player.name;
      return currentAccount.getAccount(url)
        .then(function (player) {
          currentAccount.getPlayerCard(player).then(function (teammate) {
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
