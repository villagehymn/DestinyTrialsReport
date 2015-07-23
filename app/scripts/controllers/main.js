'use strict';

angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams, currentAccount, trialsStats, inventoryStats, requestUrl, bungieStatus, $q, $log, localStorageService, $analytics) {
    $scope.status = bungieStatus;
    $scope.DestinyMedalDefinition = DestinyMedalDefinition;
    $scope.DestinyWeaponDefinition = DestinyWeaponDefinition;
    if (angular.isUndefined(localStorageService.get('platform'))) {
      $scope.platformValue = true;
      $scope.platform = 2;
    } else {
      $scope.platform = localStorageService.get('platform');
      $scope.platformValue = ($scope.platform === 2);
    }

    var searchFireteam = function ($scope, name, index, currentAccount, trialsStats, inventoryStats, $q, $log, getRecent, platform) {

      var searchName = function (name, index, platform) {
          return currentAccount.getAccount(name, platform)
            .then(function (player) {
              $scope.fireteam[index] = player;
              localStorageService.set('teammate'+(index+1), $scope.fireteam[index]);
              sendAnalytic('searchedPlayer', 'name', name);
              sendAnalytic('searchedPlayer', 'platform', platform);
              return player;
            });
        },
        useMember = function (teamMember, index) {
          $scope.fireteam[index] = teamMember;
          localStorageService.set('teammate'+(index+1), $scope.fireteam[index]);
          sendAnalytic('loadedPlayer', 'name', name.name);
          sendAnalytic('loadedPlayer', 'platform', $scope.fireteam[index].membershipType);
          var dfd = $q.defer();
          dfd.resolve($scope.fireteam[index]);

          return dfd.promise;
        },
        parallelLoad = function (player) {
          var methods = [
            currentAccount.getActivities(player),
            inventoryStats.getInventory($scope, player.membershipType, player.membershipId,
              player.characterId, index, $q, $log),
            trialsStats.getData(player.membershipType, player.membershipId, player.characterId)
          ];
          return $q.all(methods)
            .then($q.spread(function (activity, inv, stats) {

              if (angular.isUndefined(activity)) {
                $scope.fireteam[index] = player;
              } else {
                $scope.fireteam[index] = activity;
              }

              if (getRecent) {
                currentAccount.getFireteam(player.recentActivity, player.name).then(function (result) {
                  $scope.fireteam[0].medals = result.medals;
                  $scope.fireteam[0].allStats = result.playerAllStats;
                  $scope.fireteam[0].playerWeapons = result.playerWeapons;
                  $scope.fireteam[1] = result.fireTeam[0];
                  $scope.fireteam[2] = result.fireTeam[1];
                  localStorageService.set('teammate2', $scope.fireteam[1]);
                  localStorageService.set('teammate3', $scope.fireteam[2]);
                  searchFireteam($scope, $scope.fireteam[1], 1, currentAccount, trialsStats, inventoryStats, $q, $log);
                  searchFireteam($scope, $scope.fireteam[2], 2, currentAccount, trialsStats, inventoryStats, $q, $log);
                });
              }else {
                currentAccount.getMatchSummary(player.recentActivity, player.name, false).then(function (result) {
                  $scope.fireteam[index].allStats = result[0].allStats;
                  $scope.fireteam[index].medals = result[0].medals;
                  $scope.fireteam[index].playerWeapons = result[0].playerWeapons;
                });
              }

              $scope.fireteam[index].stats = stats;
              $http({
                method: 'GET', url: requestUrl.url + 'Destiny/Vanguard/Grimoire/' +
                $scope.fireteam[index].membershipType + '/' + $scope.fireteam[index].membershipId + '/?single=401030'
              }).then(function (result) {
                $scope.fireteam[index].lighthouse = (result.data.Response.data.cardCollection.length > 0);
              });
            })
          );
        },

        reportProblems = function (fault) {
          $log.error(String(fault));
        };

      if (angular.isObject(name)){
        useMember(name, index)
          .then(parallelLoad)
          .catch(reportProblems);
      }else {
        searchName(name, index, platform)
          .then(parallelLoad)
          .catch(reportProblems);
      }
    };

    $scope.searchPlayerbyName = function (name, platform) {
      if (!angular.isUndefined(name)) {
        var platformValue = 1;
        if (platform) {
          platformValue = 2;
        }
        localStorageService.set('platform', platformValue);

        searchFireteam($scope, name, 0, currentAccount, trialsStats, inventoryStats, $q, $log, true, platformValue);
      }
    };

    $scope.getPlayerbyName = function (name, index) {
      if (!angular.isUndefined(name)) {
        sendAnalytic('searchedIndividual', 'name', name);
        searchFireteam($scope, name, index, currentAccount, trialsStats, inventoryStats, $q, $log, false, $scope.platform);
      }
    };

    $scope.getRecentPlayer = function (player, index) {
      searchFireteam($scope, player, index, currentAccount, trialsStats, inventoryStats, $q, $log, false, player.membershipType);
    };

    function getPlayersFromGame($scope, activity) {
      var path = requestUrl.url;
      return $http({
        method: 'GET',
        url: path + 'Destiny/Stats/PostGameCarnageReport/' + activity.id
      }).then(function (result) {
        var fireteamIndex = [];
        var recents = {};
        if (activity.standing === 0) {
          fireteamIndex = [0, 1, 2];
        } else {
          fireteamIndex = [3, 4, 5];
        }
        angular.forEach(fireteamIndex, function (idx) {
          var allStats = {};
          var member = result.data.Response.data.entries[idx];
          var player = member.player;
          if (angular.lowercase(player.destinyUserInfo.displayName) !== angular.lowercase($scope.fireteam[0].name)) {
            var medals = [];
            angular.forEach(member.extended.values,function(value,index){
              if (index.substring(0, 6) == "medals"){
                medals.push({id: index,
                  count: value.basic.value});
              }else {
                allStats[index] = value;
              }
            });
            recents[member.player.destinyUserInfo.displayName] = {
              name: member.player.destinyUserInfo.displayName,
              membershipId: member.player.destinyUserInfo.membershipId,
              membershipType: member.player.destinyUserInfo.membershipType,
              emblem: 'http://www.bungie.net/' + member.player.destinyUserInfo.iconPath,
              characterId: member.characterId,
              allStats: allStats,
              medals: medals,
              playerWeapons: member.extended.weapons,
              level: member.player.characterLevel,
              class: member.player.characterClass
            };
          }
        });
        return recents;
      });
    }

    var getActivitiesFromChar = function ($scope, account, character, currentAccount, trialsStats, inventoryStats, $q, $log) {

      var setRecentActivities = function (account, character) {
          return currentAccount.getLastTwentyOne(account, character)
            .then(function (activities) {
              return activities;
            });
        },

        setRecentPlayers = function (activities) {
          angular.forEach(activities, function (activity) {
            getPlayersFromGame($scope, activity).then(function (result) {
              $scope.recentPlayers = angular.extend($scope.recentPlayers, result);
            });
          });
        },

        reportProblems = function (fault) {
          $log.error(String(fault));
        };

      setRecentActivities(account, character)
        .then(setRecentPlayers)
        .catch(reportProblems);
    };

    $scope.suggestRecentPlayers = function () {
      $scope.recentPlayers = {};
      angular.forEach($scope.fireteam[0].allCharacters, function (character) {
        getActivitiesFromChar($scope, $scope.fireteam[0], character, currentAccount, trialsStats, inventoryStats, $q, $log);
      });
    };

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat, label: label
      });
    };

    if (angular.isObject(localStorageService.get('teammate1'))) {
      $scope.fireteam = [];
      $scope.fireteam[0] = null;
      $scope.getRecentPlayer(localStorageService.get('teammate1'), 0);
      if (angular.isObject(localStorageService.get('teammate2'))) {
        $scope.fireteam[1] = null;
        $scope.getRecentPlayer(localStorageService.get('teammate2'), 1);
      }
      if (angular.isObject(localStorageService.get('teammate3'))) {
        $scope.fireteam[2] = null;
        $scope.getRecentPlayer(localStorageService.get('teammate3'), 2);
      }
    }else{
      $scope.fireteam = [];
      $scope.fireteam[0] = null;
    }
  });
