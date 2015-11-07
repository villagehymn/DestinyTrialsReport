'use strict';

var getActivitiesFromChar = function ($scope, account, currentAccount) {

  var setRecentActivities = function (account) {
      return currentAccount.getLastTwentyOne(account)
        .then(function (activities) {
          return activities;
        });
    },

    setRecentPlayers = function (activities) {
      angular.forEach(activities, function (activity) {
        currentAccount.getFireteamFromActivitiy(activity, account.membershipId).then(function (resMembers) {
          var recents = {};
          angular.forEach(resMembers, function (member, key) {
            if (key !== account.membershipId) {
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

  setRecentActivities(account)
    .then(setRecentPlayers)
    .catch(reportProblems);
};

angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $routeParams, $filter, locationChanger, $localStorage, currentAccount, config, guardianFactory) {
    $scope.currentMap = DestinyCrucibleMapDefinition[4287936726];
    $scope.subdomain = config.subdomain === 'my';
    $scope.$storage = $localStorage.$default({
      platform: true
    });

    $scope.DestinyCrucibleMapDefinition = DestinyCrucibleMapDefinition;
    $scope.DestinyHazardDefinition = DestinyHazardDefinition;
    $scope.DestinyMedalDefinition = DestinyMedalDefinition;
    $scope.DestinyWeaponDefinition = DestinyWeaponDefinition;

    $scope.weaponKills = weaponKills;
    $scope.statNamesByHash = statNamesByHash;

    $scope.focusOnPlayers = false;
    $scope.switchFocus = function () {
      $scope.focusOnPlayers = !$scope.focusOnPlayers;
    };

    $scope.focusOnPlayer = 1;
    $scope.shiftPlayerFocus = function (direction) {
      $scope.focusOnPlayer = Math.min(3, Math.max(1, $scope.focusOnPlayer + Math.floor(window.innerWidth / 320) * direction));
    };

    $scope.suggestRecentPlayers = function () {
      if (angular.isUndefined($scope.recentPlayers)) {
        $scope.recentPlayers = {};
        getActivitiesFromChar($scope, $scope.fireteam[0], currentAccount);
        $scope.recentPlayersCopy = $scope.recentPlayers;
      }
    };

    $scope.filter = function (change) {
      var result = {};
      angular.forEach($scope.recentPlayersCopy, function (value, key) {
        if (angular.lowercase(key).indexOf(angular.lowercase(change)) === 0) {
          result[key] = value;
        }
      });
      $scope.recentPlayers = result;
    };

    $scope.refreshInventory = function (fireteam) {
      angular.forEach(fireteam, function (player, index) {
        currentAccount.refreshInventory($scope.fireteam[index]).then(function (teammate) {
          $scope.$evalAsync($scope.fireteam[index] = teammate);
        });
      });
    };

    $scope.togglePlatform = function () {
      $scope.platformValue = !$scope.platformValue;
      $localStorage.platform = $scope.platformValue;
      $scope.platformNumeric = $scope.platformValue ? 2 : 1;
      if (config.gggWeapons) {
        if (!$scope.gggWeapons[$scope.platformNumeric]) {
          return guardianFactory.getWeapons(
            $scope.platformNumeric
          ).then(function (result) {
              $scope.gggWeapons[$scope.platformNumeric] = result.gggWeapons;
            });
        }
      }
    };

    $scope.getWeaponTypeByIndex = function (index) {
      switch (index) {
        case 0:
          return 'Primary';
          break;
        case 1:
          return 'Special';
          break;
        case 2:
          return 'Heavy';
          break;
      }
    };

    if ($routeParams.playerName) {
      $scope.searchedPlayer = $routeParams.playerName;
    }

    if ($routeParams.platformName) {
      $scope.platformValue = $routeParams.platformName === 'ps';
    } else {
      $scope.platformValue = $scope.$storage.platform;
    }

    if (config.fireteam) {
      $scope.fireteam = config.fireteam;
      $scope.$storage.platform = ($routeParams.platformName === 'ps');
      if (angular.isDefined($scope.fireteam[0])) {
        $scope.platformValue = $scope.fireteam[0].membershipType === 2;
        if ($scope.fireteam[0] && $scope.fireteam[1] && $scope.fireteam[2]) {
          if ($scope.fireteam[2].membershipId) {
            $scope.focusOnPlayers = true;
            var platformUrl = $scope.platformValue ? '/ps/' : '/xbox/';
            if (!$scope.subdomain && angular.isDefined(config.updateUrl)) {
              locationChanger.skipReload()
                .withoutRefresh(platformUrl + $scope.fireteam[0].name + '/' +
                $scope.fireteam[1].name + '/' + $scope.fireteam[2].name, true);
            }
          }
        }
      } else {
        $scope.fireteam = null;
      }
    }

    if (config.gggWeapons) {
      $scope.gggWeapons = {};
      $scope.gggWeapons[config.platformNumeric] = config.gggWeapons.gggWeapons;
      $scope.platformNumeric = config.platformNumeric;
      $scope.dateBeginTrials = config.gggWeapons.dateBeginTrials;
    }
  });
