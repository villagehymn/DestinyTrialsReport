'use strict';

var getActivitiesFromChar = function ($scope, account, character, currentAccount) {

  var setRecentActivities = function (account, character) {
      return currentAccount.getLastTwentyOne(account, character)
        .then(function (activities) {
          return activities;
        });
    },

    setRecentPlayers = function (activities) {
      angular.forEach(activities, function (activity) {
        currentAccount.getMatchSummary(activity, account.id).then(function (resMembers) {
          var recents = {};
          angular.forEach(resMembers, function (member, key) {
            if (key !== account.id) {
              recents[member.name] = member;
            }
          });
          $scope.recentPlayers = angular.extend($scope.recentPlayers, recents);
        });
      });
    },

    reportProblems = function (fault) {
      console.log(String(fault));
    };

  setRecentActivities(account, character)
    .then(setRecentPlayers)
    .catch(reportProblems);
};

angular.module('trialsReportApp')
  .controller('PlayerCtrl', function ($scope, $routeParams, currentAccount, $analytics, $location, locationChanger, $localStorage, playerCard) {

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat,
        label: label
      });
    };

    function getAccountByName(name, platform, index) {
      if (angular.isUndefined(name)) {
        return;
      }
      return currentAccount.getAccount(name, platform)
        .then(function (player) {
          sendAnalytic('searchedPlayer', 'name', name);
          sendAnalytic('searchedPlayer', 'platform', platform);
          player.searched = true;
          playerCard.getPlayerCard(player).then(function (teammate) {
            $scope.$evalAsync( $scope.fireteam[index] = teammate );
          });
        });
    }

    $scope.searchPlayerbyName = function (name, platform, index, includeFireteam) {
      if (angular.isDefined(name)) {
        getAccountByName(name, (platform ? 2 : 1), index);
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


    $scope.setRecentPlayer = function (player, index, getFireteam) {
      return currentAccount.getAccount(player.name, player.membershipType)
        .then(function (player) {
          player.otherCharacters = $scope.fireteam[index].otherCharacters;
          player.searched = getFireteam;
          playerCard.getPlayerCard(player).then(function (teammate) {
            $scope.$evalAsync( $scope.fireteam[index] = teammate );
            if (getFireteam) {
              var charCount = 1;
              angular.forEach($scope.fireteam[0].fireTeam, function (member) {
                playerCard.getPlayerCard(member).then(function (teammate) {
                  $scope.$evalAsync( $scope.fireteam[charCount] = teammate );
                  charCount++;
                });
              });
            }
          });
        });
    };

    $scope.suggestRecentPlayers = function () {
      if (angular.isUndefined($scope.recentPlayers)) {
        $scope.recentPlayers = {};
        angular.forEach($scope.fireteam[0].otherCharacters, function (character) {
          getActivitiesFromChar($scope, $scope.fireteam[0], character, currentAccount);
        });
      }
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
