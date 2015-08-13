'use strict';

angular.module('trialsReportApp')
  .controller('ProfileCtrl', function ($scope, $http, $routeParams, fireTeam, currentAccount, trialsStats, inventoryStats, requestUrl, $q, $log, $analytics, toastr, $timeout, $location, $rootScope, locationChanger) {
    $scope.helpOverlay = false;
    $scope.timerRunning = true;
    $scope.DestinyMedalDefinition = DestinyMedalDefinition;
    $scope.DestinyPrimaryWeaponDefinitions = DestinyPrimaryWeaponDefinitions;
    $scope.DestinySpecialWeaponDefinitions = DestinySpecialWeaponDefinitions;
    $scope.DestinyHeavyWeaponDefinitions = DestinyHeavyWeaponDefinitions;
    $scope.DestinyTrialsDefinitions = DestinyTrialsDefinitions;
    $scope.DestinyHazardDefinition = {
      'Double Grenade': 'This Guardian can hold two grenades.',
      'Superburn Grenade': 'This Guardian has grenades that cause very strong burning.',
      'Revive Kill Sniper': 'This Guardian can one hit kill a revived Guardian with equipped sniper rifle.',
      'Quick Revive': 'This Guardian can revive allies and be revived very quickly.',
      'Grenade on Spawn': 'This Guardian will have a grenade every round.',
      'Final Round Sniper': 'This Guardian has a sniper rifle that can one hit kill a Guardian with a body shot.',
      'Blink Shotgun': 'This Guardian is using Blink and has a shotgun equipped. Be careful!',
      'Site Developer': 'Hey! we made this site, so more than likely we are looking you up too...',
      'Site Donator': 'Part of an amazing few who\'ve help keep this site running'
    };
    $scope.headerPartial = 'views/shared/profile_header.html';
    $scope.footerPartial = 'views/shared/footer.html';
    $scope.playerPartial = 'views/fireteam/player.html';
    $scope.statPartial = 'views/fireteam/stats.html';
    $scope.infoPartial = 'views/fireteam/info.html';

    $scope.isHelpOverlayElement = function (length, index) {
      return ((length == 3 && index == 1) || (length == 2 && index == 1) || (length == 1))
    };

    var searchFireteam = function ($scope, name, index, platform) {

      var useMember = function (teamMember, index) {
          if (angular.isUndefined($scope.fireteam[index])) {
            $scope.fireteam.push(teamMember);
          } else {
            $scope.fireteam[index] = teamMember;
          }
          var dfd = $q.defer();
          dfd.resolve($scope.fireteam[index]);

          return dfd.promise;
        },
        parallelLoad = function (player) {
          var methods = [
            currentAccount.getActivities(player, 250),
            inventoryStats.getInventory($scope, platform, player, index, $q),
            trialsStats.getData(platform, player.membershipId, player.characterId)
          ];
          return $q.all(methods)
            .then($q.spread(function (activity, inv, stats) {

              if (angular.isUndefined(activity)) {
                $scope.fireteam.splice(index, 1);
                if ($scope.fireteam.length === 1) {
                  $scope.singleResult = true;
                }
              } else {
                $scope.fireteam[index] = activity;
              }
              $scope.fireteam[index].nonHazard = stats.nonHazard;
              $scope.fireteam[index].stats = stats.stats;
              $scope.fireteam[index].lighthouse = stats.lighthouse;
            }));
        },

        reportProblems = function (fault) {
          console.log(String(fault));
        };

      useMember(name, index)
        .then(parallelLoad)
        .catch(reportProblems);
    };


    $scope.toggleOverlay = function () {
      $scope.helpOverlay = !$scope.helpOverlay;
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

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat,
        label: label
      });
    };

    $scope.searchPlayerbyName = function (name, platform) {
      if (angular.isDefined(name)){
          $location.path((platform ? '/ps/' : '/xbox/') + name);
      }
    };

    if (angular.isObject(fireTeam)) {
      $scope.fireteam = fireTeam;
      $scope.platformValue = $scope.fireteam[0].membershipType === 2;

      searchFireteam($scope, $scope.fireteam[0], 0, $scope.fireteam[0].membershipType, true);
      if ($scope.fireteam[0].otherCharacters.length > 1){
        for (var n = 0; n < $scope.fireteam[0].otherCharacters.length; n++) {
          if ($scope.fireteam[0].otherCharacters[n].characterId !== $scope.fireteam[0].characterId) {
            $scope.fireteam.push($scope.fireteam[0].otherCharacters[n]);
            var index = $scope.fireteam.length - 1;
            searchFireteam($scope, $scope.fireteam[index], index, $scope.fireteam[index].membershipType, true);
          }
        }
      } else {
        $scope.singleResult = true;
      }
      //console.log($scope.fireteam);
    }else if (angular.isString(fireTeam)){
      $scope.status = fireTeam;
    } else {
      $scope.platformValue = true;
    }
  });
