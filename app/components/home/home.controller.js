'use strict';

var getActivitiesFromChar = function ($scope, account, homeFactory) {

  var setRecentActivities = function (account) {
      return homeFactory.getLastTwentyOne(account)
        .then(function (activities) {
          return activities;
        });
    },

    setRecentPlayers = function (activities) {
      angular.forEach(activities, function (activity) {
        homeFactory.getFireteamFromActivitiy(activity, account.membershipId).then(function (resMembers) {
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
  .controller('homeController', function ($scope, $routeParams, locationChanger, $localStorage, homeFactory, config, $filter, guardianggFactory) {
    $scope.currentMap = DestinyCrucibleMapDefinition[1851417512];
    $scope.subdomain = config.subdomain === 'my';
    $scope.$storage = $localStorage.$default({
      platform: true
    });

    $scope.DestinyCrucibleMapDefinition = DestinyCrucibleMapDefinition;
    $scope.DestinyHazardDefinition = DestinyHazardDefinition;
    $scope.DestinyMedalDefinition = DestinyMedalDefinition;
    $scope.DestinyWeaponDefinition = DestinyWeaponDefinition;
    $scope.DestinyTalentGridDefinition = DestinyTalentGridDefinition;

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
        getActivitiesFromChar($scope, $scope.fireteam[0], homeFactory);
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
        homeFactory.refreshInventory($scope.fireteam[index]).then(function (teammate) {
          $scope.$evalAsync($scope.fireteam[index] = teammate);
        });
      });
    };

    $scope.gggLoadWeapons = function (platform) {
      $scope.platformNumeric = platform ? 2 : 1;
      if ($scope.gggWeapons) {
        if (!$scope.gggWeapons[$scope.platformNumeric]) {
          return guardianggFactory.getWeapons(
            $scope.platformNumeric
          ).then(function (result) {
              $scope.gggWeapons[$scope.platformNumeric] = result.gggWeapons;
              $scope.gggWeapons[$scope.platformNumeric].show = result.show;
              $scope.gggShow = $scope.gggWeapons[$scope.platformNumeric].show;
            });
        } else {
          $scope.gggShow = $scope.gggWeapons[$scope.platformNumeric].show;
        }
      }
    };

    $scope.togglePlatform = function () {
      $scope.platformValue = !$scope.platformValue;
      $scope.$storage.platform = $scope.platformValue;
      $scope.gggLoadWeapons($scope.platformValue);
    };

    $scope.setPlatform = function (platformBool) {
      $scope.platformValue = platformBool;
      $scope.$storage.platform = $scope.platformValue;
      $scope.gggLoadWeapons($scope.platformValue);
      return platformBool;
    };

    $scope.getWeaponTypeByIndex = function (index) {
      switch (index) {
        case 0: return 'Primary';
        case 1: return 'Special';
        case 2: return 'Heavy';
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

    var getGggTierByElo = function (elo) {
      if (elo < 1100) return 'Bronze';
      if (elo < 1300) return 'Silver';
      if (elo < 1500) return 'Gold';
      if (elo < 1700) return 'Platinum';
      return 'Diamond';
    };

    if (config.fireteam) {
      $scope.fireteam = config.fireteam;
      $scope.$storage.platform = ($routeParams.platformName === 'ps');
      if (angular.isDefined($scope.fireteam[0])) {
        $scope.platformValue = $scope.fireteam[0].membershipType === 2;
        if ($scope.fireteam[0] && $scope.fireteam[1] && $scope.fireteam[2]) {
          if ($scope.fireteam[2].membershipId) {
            $scope.focusOnPlayers = true;
            var platformUrl = $scope.platformValue ? '/ps/' : '/xbox/';

            guardianggFactory.getElo($scope.fireteam).then(function (elo) {
              if (elo.players) {
                var playerElo;
                angular.forEach($scope.fireteam, function (player) {
                  playerElo = elo.players[player.membershipId];
                  if (playerElo) {
                    player.ggg = playerElo;
                    player.ggg.tier = getGggTierByElo(player.ggg.elo);
                    if (player.ggg.rank > 0) {
                      player.ggg.rank = '#' + $filter('number')(player.ggg.rank);
                    } else if (player.ggg.rank == -1) {
                      player.ggg.rank = 'Placing';
                    } else if (player.ggg.rank == -2) {
                      player.ggg.rank = 'Inactive';
                    }
                  }
                });
              }
            });

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
      $scope.gggWeapons[config.platformNumeric].show = config.gggWeapons.show;
      $scope.platformNumeric = config.platformNumeric;
      $scope.dateBeginTrials = config.gggWeapons.dateBeginTrials;
      $scope.dateEndTrials = config.gggWeapons.dateEndTrials;
      $scope.gggShow = $scope.gggWeapons[config.platformNumeric].show;
    }
  });
