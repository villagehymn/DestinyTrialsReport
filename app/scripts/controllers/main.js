'use strict';

angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams, fireTeam, currentAccount, trialsStats, inventoryStats, requestUrl, $q, $log, localStorageService, $analytics, toastr, $interval, $location) {
    $scope.status = null;
    $scope.helpOverlay = false;
    $scope.DestinyMedalDefinition = DestinyMedalDefinition;
    $scope.DestinyWeaponDefinition = DestinyWeaponDefinition;
    $scope.DestinyTrialsDefinitions = DestinyTrialsDefinitions;
    $scope.dummyFireteam = dummyFireteam;

    function setPlatform($scope, platformValue) {
      $scope.platformValue = platformValue;
      $scope.platform = platformValue ? 2 : 1;
      localStorageService.set('platform', $scope.platform);
    }

    if (localStorageService.get('platform') === true || localStorageService.get('platform') === false) {
      setPlatform($scope, localStorageService.get('platform'));
    } else {
      setPlatform($scope, true);
    }

    function getRecentFireteam($scope, result, platform) {
      $scope.fireteam.push(result.fireTeam[0]);
      $scope.fireteam.push(result.fireTeam[1]);
      searchFireteam($scope, $scope.fireteam[1], 1, platform);
      searchFireteam($scope, $scope.fireteam[2], 2, platform);
    }

    function setPlayerStats(player, index, stats, $scope) {
      currentAccount.getFireteam(player.recentActivity, player.name).then(function (result) {
        $scope.fireteam[index].medals = result.medals;
        $scope.fireteam[index].allStats = result.playerAllStats;
        $scope.fireteam[index].playerWeapons = result.playerWeapons;
        $scope.fireteam[index].stats = stats;
        checkGrimoire($scope, $scope.fireteam[index], index);
        if (index === 0){
          getRecentFireteam($scope, result, player.membershipType);
        }
      });
    }

    function getAccountByName(name, platform, $scope, index) {
      if (angular.isUndefined(name)){return}
      return currentAccount.getAccount(name, platform)
        .then(function (player) {
          if (!angular.isObject(player)) {
            $interval(function () {
              $scope.helpOverlay = true;
            }, 500);
          }
          return player;
        }).then(function (player) {
          sendAnalytic('searchedPlayer', 'name', name);
          sendAnalytic('searchedPlayer', 'platform', platform);
          searchFireteam($scope, player, index, platform);
        });
    }

    function checkGrimoire($scope, player, index) {
      $http({
        method: 'GET', url: requestUrl.url + 'Destiny/Vanguard/Grimoire/' +
        player.membershipType + '/' + player.membershipId + '/?single=401030'
      }).then(function (result) {
        $scope.fireteam[index].lighthouse = (result.data.Response.data.cardCollection.length > 0);
      });
    }

    var searchFireteam = function ($scope, name, index, platform) {

      var useMember = function (teamMember, index) {
          if (index === 0) {
            $scope.fireteam = [teamMember];
          }else if (angular.isUndefined($scope.fireteam[index])){
            $scope.fireteam.push(teamMember);
          }else {
            $scope.fireteam[index] = teamMember
          }
          localStorageService.set('teammate'+(index+1), $scope.fireteam[index]);
          var dfd = $q.defer();
          dfd.resolve($scope.fireteam[index]);

          return dfd.promise;
        },
        parallelLoad = function (player) {
          var methods = [
            currentAccount.getActivities(player),
            inventoryStats.getInventory($scope, platform, player.membershipId,
              player.characterId, index, $q),
            trialsStats.getData(platform, player.membershipId, player.characterId)
          ];
          return $q.all(methods)
            .then($q.spread(function (activity, inv, stats) {

              if (angular.isUndefined(activity)) {
                $scope.fireteam[index] = player;
              } else {
                $scope.fireteam[index] = activity;
              }

              setPlayerStats(player, index, stats, $scope);
            })
          );
        },

        reportProblems = function (fault) {
          //$log.error(String(fault));
        };

      useMember(name, index)
        .then(parallelLoad)
        .catch(reportProblems);
    };

    if (angular.isObject(fireTeam)){
      $scope.fireteam = [fireTeam];
      searchFireteam($scope, $scope.fireteam[0], 0, $scope.fireteam[0].membershipType);
    }

    $scope.searchPlayerbyName = function (name, platform, index) {
      getAccountByName(name, (platform ? 2 : 1), $scope, index);
      sendAnalytic('loadedPlayer', 'name', name);
      sendAnalytic('loadedPlayer', 'platform', (platform ? 2 : 1));
      $location.path('/' + (platform ? 'ps' : 'xbox') + '/' + name, false);
      setPlatform($scope, platform);
    };

    $scope.refreshInventory = function () {
      angular.forEach($scope.fireteam, function (player, index) {
        inventoryStats.getInventory($scope, player.membershipType, player.membershipId,
          player.characterId, index, $q)
      });
    };

    $scope.setRecentPlayer = function (player, index) {
      setPlatform($scope, player.membershipType === 2);
      searchFireteam($scope, player, index, player.membershipType);
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

    var getActivitiesFromChar = function ($scope, account, character) {

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
          //$log.error(String(fault));
        };

      setRecentActivities(account, character)
        .then(setRecentPlayers)
        .catch(reportProblems);
    };

    $scope.suggestRecentPlayers = function () {
      $scope.recentPlayers = {};
      angular.forEach($scope.fireteam[0].allCharacters, function (character) {
        getActivitiesFromChar($scope, $scope.fireteam[0], character);
      });
    };

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat, label: label
      });
    };

    //if (!angular.isUndefined($routeParams.playerName)){
    //  $scope.fireteam = [];
    //  $scope.fireteam[0] = null;
    //  if ($routeParams.platform === 'xbox') {
    //    setPlatform($scope, false);
    //  }else if ($routeParams.platform ==='ps'){
    //    setPlatform($scope, true);
    //  }else {
    //    toastr.error("Please use 'xbox' or 'ps'", 'Unrecognised Platform');
    //  }
    //  $scope.searchPlayerbyName($routeParams.playerName, $scope.platformValue);
    //} else {
    //  if (angular.isObject(localStorageService.get('teammate1'))) {
    //    $scope.fireteam = [];
    //    $scope.fireteam[0] = null;
    //    $scope.getRecentPlayer(localStorageService.get('teammate1'), 0);
    //    if (angular.isObject(localStorageService.get('teammate2'))) {
    //      $scope.fireteam[1] = null;
    //      $scope.getRecentPlayer(localStorageService.get('teammate2'), 1);
    //    }
    //    if (angular.isObject(localStorageService.get('teammate3'))) {
    //      $scope.fireteam[2] = null;
    //      $scope.getRecentPlayer(localStorageService.get('teammate3'), 2);
    //    }
    //  }else{
    //    $scope.fireteam = [];
    //    $scope.fireteam[0] = null;
    //    $interval(function() {
    //      $scope.helpOverlay = true;
    //    },500);
    //  }
    //}
  });
