'use strict';

function getTeammates($scope, locationChanger, mainPlayer) {
  if ($scope.subdomain) {
    getTeammatesFromCharacters($scope, mainPlayer.characters);
  }
  else {
    if (mainPlayer.searched){
      if (mainPlayer.fireTeam){
        addFireteamMember(mainPlayer.fireTeam, $scope, locationChanger);
      }
      else {
        $scope.fireteam.push(
          {invalidResult: true},
          {invalidResult: true}
        );
      }
    }
  }
}

function getTeammatesFromCharacters($scope, fireTeam) {
  $scope.fireteam[0].searched = true;
  angular.forEach(fireTeam, function (player) {
    if (player.characterInfo.characterId !== $scope.fireteam[0].characterInfo.characterId) {
      player.myProfile = true;
      $scope.fireteam.push(player);
    }
  });
}

function addFireteamMember(fireTeam, $scope, locationChanger) {
  angular.forEach(fireTeam, function (player) {
    if (player) {
      player.refreshCharacter = $scope.fireteam[0].updateTeammates;
      $scope.fireteam.push(player);
      if (locationChanger){
        updateUrl($scope, locationChanger);
      }
    } else {
      $scope.fireteam.push(
        {invalidResult: true}
      );
    }
    if ($scope.fireteam.length === 3) {
      $scope.focusOnPlayers = true;
    }
  });
}

function updateUrl($scope, locationChanger) {
  if ($scope.fireteam[0] && $scope.fireteam[1] && $scope.fireteam[2]) {
    if ($scope.fireteam[2].membershipId) {
      var platformUrl = $scope.platformValue ? '/ps/' : '/xbox/';
      locationChanger.skipReload()
        .withoutRefresh(platformUrl + $scope.fireteam[0].name + '/' +
        $scope.fireteam[1].name + '/' + $scope.fireteam[2].name, true);
    }
  }
}

var getActivitiesFromChar = function ($scope, account, character, currentAccount, trialsStats) {

  var setRecentActivities = function (account, character) {
      return currentAccount.getLastTwentyOne(account, character)
        .then(function (activities) {
          return activities;
        });
    },

    setRecentPlayers = function (activities) {
      angular.forEach(activities, function (activity) {
        trialsStats.getFireteamFromActivitiy(activity, account.membershipId).then(function (resMembers) {
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

  setRecentActivities(account, character)
    .then(setRecentPlayers)
    .catch(reportProblems);
};

angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $routeParams, fireTeam, subDomain, locationChanger, $localStorage, currentAccount, trialsStats, $window) {
    $scope.currentMap = DestinyCrucibleMapDefinition[3412406993];
    $scope.subdomain = subDomain.name === 'my';
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
        angular.forEach($scope.fireteam[0].characters, function (character) {
          getActivitiesFromChar($scope, $scope.fireteam[0], character, currentAccount, trialsStats);
        });
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

    if ($routeParams.playerName) {
      $scope.searchedPlayer = $routeParams.playerName;
    }

    if ($routeParams.platformName) {
      $scope.platformValue = $routeParams.platformName === 'ps';
    } else {
      $scope.platformValue = $scope.$storage.platform;
    }

    if (angular.isObject(fireTeam)) {
      $scope.fireteam = fireTeam;
      $scope.$storage.platform = ($routeParams.platformName === 'ps');
      if (angular.isDefined($scope.fireteam[0])) {
        $scope.platformValue = $scope.fireteam[0].membershipType === 2;
        getTeammates($scope, locationChanger, $scope.fireteam[0]);
      } else {
        $scope.fireteam = null;
      }
    } else if (angular.isString(fireTeam)) {
      $scope.status = fireTeam;
    }
  });
