'use strict';

angular.module('trialsReportApp')
  .controller('homeController', function ($scope, $routeParams, locationChanger, $localStorage, homeFactory, config, $filter, guardianggFactory, api, guardianGG) {
    $scope.currentMap = DestinyCrucibleMapDefinition[4200263342];
    $scope.subdomain = config.subdomain === 'my';
    $scope.$storage = $localStorage.$default({
      platform: true
    });

    //if ($scope.$storage.currentMap && (moment.utc().diff($scope.$storage.currentMapDate, 'days') > 2 )) {
    //  $scope.currentMap = DestinyCrucibleMapDefinition[$scope.$storage.currentMap];
    //} else {
    //  return guardianGG.getMap().then(function (result) {
    //    var map = result.data;
    //    if (map && map.hash != 0) {
    //      var now = moment.utc();
    //      $scope.$storage.currentMap = map.hash;
    //      $scope.$storage.currentMapDate = now;
    //      $scope.currentMap = DestinyCrucibleMapDefinition[map.hash];
    //    } else {
    //      if ($scope.$storage.currentMap) {
    //        $scope.currentMap = DestinyCrucibleMapDefinition[$scope.$storage.currentMap];
    //      } else {
    //        $scope.currentMap = DestinyCrucibleMapDefinition[4200263342];
    //      }
    //    }
    //  })
    //}

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

    function convertUTCDateToLocalDate(date) {
      var newDate = new Date(date);
      newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return newDate;
    }

    if (angular.isUndefined($scope.flawlessLeaderboard)) {
      $scope.flawlessLeaderboard = {};

      api.trialsFirst()
        .then(function (matches) {
          angular.forEach(matches.data, function (match) {
            return api.teamByMatch(
              match.instanceId
            ).then(function (result) {
                $scope.flawlessLeaderboard[match.instanceId] = result.data;
                $scope.flawlessLeaderboard[match.instanceId].date = convertUTCDateToLocalDate(new Date(result.data[0].date));
                $scope.flawlessLeaderboard[match.instanceId].instanceId = match.instanceId;
                $scope.flawlessLeaderboard[match.instanceId].map = DestinyCrucibleMapDefinition[match.referenceId].pgcrImage;
              });
          });
        });
    }

    $scope.focusOnPlayer = 1;
    $scope.shiftPlayerFocus = function (direction) {
      $scope.focusOnPlayer = Math.min(3, Math.max(1, $scope.focusOnPlayer + Math.floor(window.innerWidth / 320) * direction));
    };

    $scope.suggestRecentPlayers = function () {
      if (angular.isUndefined($scope.recentPlayers)) {
        $scope.recentPlayers = {};
        return api.recentTeammates(
          $scope.fireteam[0].membershipId
        ).then(function (result) {
            var recents = {};
            angular.forEach(result.data, function (member) {
              if (member.membershipId !==  $scope.fireteam[0].membershipId) {
                recents[member.displayName] = member;
              }
            });
            $scope.recentPlayers = angular.extend($scope.recentPlayers, recents);
            $scope.recentPlayersCopy = $scope.recentPlayers;
          });
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

    if (config.fireteam) {
      $scope.fireteam = config.fireteam;
      $scope.$storage.platform = ($routeParams.platformName === 'ps');
      if (angular.isDefined($scope.fireteam[0])) {
        $scope.platformValue = $scope.fireteam[0].membershipType === 2;
        if ($scope.fireteam[0] && $scope.fireteam[1] && $scope.fireteam[2]) {
          if ($scope.fireteam[2].membershipId) {
            $scope.focusOnPlayers = true;
            var platformUrl = $scope.platformValue ? '/ps/' : '/xbox/';

            //guardianggFactory.getElo($scope.fireteam);

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
