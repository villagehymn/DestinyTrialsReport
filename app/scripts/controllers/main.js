'use strict';

angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $routeParams, fireTeam, currentAccount, trialsStats, inventoryStats, $q, $log, $analytics, $location, locationChanger, $cookieStore) {
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
    $scope.headerPartial = 'views/shared/header.html';
    $scope.footerPartial = 'views/shared/footer.html';
    $scope.playerPartial = 'views/fireteam/player.html';
    $scope.statPartial = 'views/fireteam/stats.html';
    $scope.infoPartial = 'views/fireteam/info.html';

    if ($routeParams.playerName) {
      $scope.searchedPlayer = $routeParams.playerName;
    }

    if ($routeParams.platformName) {
      $scope.platformValue = $routeParams.platformName === 'ps';
    } else {
      if (angular.isDefined($cookieStore.get('savedPlatform'))) {
        $scope.platformValue = $cookieStore.get('savedPlatform');
      } else {
        $scope.platformValue = true;
      }
    }

    var segments = location.hostname.split('.');
    $scope.subdomain = segments.length>2?segments[segments.length-3].toLowerCase():null;

    function setPlatform($scope, platformValue) {
      $scope.platformValue = platformValue;
      $scope.platform = platformValue ? 2 : 1;
    }

    function setRecentFireteam($scope, result, platform, includeTeam) {
      if (includeTeam) {
        if ($scope.fireteam[1]){
          $scope.fireteam[1] = result.fireTeam[0];
        } else {
          $scope.fireteam.push(result.fireTeam[0]);
        }
        if ($scope.fireteam[2]){
          $scope.fireteam[2] = result.fireTeam[1];
        } else {
          $scope.fireteam.push(result.fireTeam[1]);
        }
        searchFireteam($scope, $scope.fireteam[1], 1, platform);
        searchFireteam($scope, $scope.fireteam[2], 2, platform);
      }
    }

    function setPostActivityStats($scope, index, result) {
      $scope.fireteam[index].medals = result.medals;
      $scope.fireteam[index].allStats = result.playerAllStats;
      $scope.fireteam[index].wKills = result.wKills;
      $scope.fireteam[index].playerWeapons = result.playerWeapons;
    }

    function setPlayerStats(player, index, stats, includeTeam, $scope) {
      currentAccount.getFireteam(player.recentActivity, player.name).then(function (result) {
        $scope.fireteam[index].fireTeam = result.fireTeam;
        setPostActivityStats($scope, index, result, stats);
        if (index === 0 && angular.isUndefined($scope.fireteam[0].teamFromParams)) {
          setRecentFireteam($scope, result, player.membershipType, includeTeam);
        }
      });
    }

    function getAccountByName(name, platform, $scope, index, includeFireteam) {
      if (angular.isUndefined(name)) {
        return;
      }
      return currentAccount.getAccount(name, platform)
        .then(function (player) {
          return player;
        }).then(function (player) {
          sendAnalytic('searchedPlayer', 'name', name);
          sendAnalytic('searchedPlayer', 'platform', platform);
          searchFireteam($scope, player, index, platform, includeFireteam);
        });
    }

    var searchFireteam = function ($scope, name, index, platform, includeFireteam) {

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
            currentAccount.getActivities(player, 25),
            inventoryStats.getInventory($scope, platform, player, index, $q),
            trialsStats.getData(platform, player.membershipId, player.characterId)
          ];
          return $q.all(methods)
            .then($q.spread(function (activity, inv, stats) {

              if (angular.isUndefined(activity)) {
                $scope.fireteam[index] = player;
              } else {
                $scope.fireteam[index] = activity;
              }
              $scope.fireteam[index].stats = stats.stats;
              $scope.fireteam[index].nonHazard = stats.nonHazard;
              $scope.fireteam[index].lighthouse = stats.lighthouse;
              if (includeFireteam) {
                setPlayerStats(player, index, stats, includeFireteam, $scope);
              }

              if (angular.isDefined($scope.fireteam[0]) &&
                  angular.isDefined($scope.fireteam[1]) &&
                  angular.isDefined($scope.fireteam[2])) {
                var platformUrl = platform === 2 ? '/ps/' : '/xbox/';
                locationChanger.skipReload().withoutRefresh(platformUrl + $scope.fireteam[0].name + '/' + $scope.fireteam[1].name + '/' + $scope.fireteam[2].name, true);
              }
            }));
        },

        reportProblems = function (fault) {
          console.log(String(fault));
          //$log.error(String(fault));
        };

      useMember(name, index)
        .then(parallelLoad)
        .catch(reportProblems);
    };

    $scope.searchPlayerbyName = function (name, platform, index, includeFireteam) {
      if (angular.isDefined(name)) {
        if (includeFireteam) {
          $location.path((platform ? '/ps/' : '/xbox/') + name);
        } else {
          getAccountByName(name, (platform ? 2 : 1), $scope, index, true);
          sendAnalytic('loadedPlayer', 'name', name);
          sendAnalytic('loadedPlayer', 'platform', (platform ? 2 : 1));
          setPlatform($scope, platform);
        }
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

    $scope.refreshInventory = function () {
      angular.forEach($scope.fireteam, function (player, index) {
        searchFireteam($scope, player, index, player.membershipType, false);
        //inventoryStats.getInventory($scope, player.membershipType, player, index, $q);
      });
    };

    $scope.setRecentPlayer = function (player, index, includeFireteam) {
      setPlatform($scope, player.membershipType === 2);
      player.otherCharacters = $scope.fireteam[0].otherCharacters;
      searchFireteam($scope, player, index, player.membershipType, includeFireteam);
    };

    var getActivitiesFromChar = function ($scope, account, character) {

      var setRecentActivities = function (account, character) {
          return currentAccount.getLastTwentyOne(account, character)
            .then(function (activities) {
              return activities;
            });
        },

        setRecentPlayers = function (activities) {
          angular.forEach(activities, function (activity) {
            currentAccount.getMatchSummary(activity, account.name, false, true).then(function (resMember) {
              var member = resMember[0];
              var recents = {};
              recents[member.player.destinyUserInfo.displayName] = {
                name: member.player.destinyUserInfo.displayName,
                membershipId: member.player.destinyUserInfo.membershipId,
                membershipType: member.player.destinyUserInfo.membershipType,
                emblem: 'https://www.bungie.net' + member.player.destinyUserInfo.iconPath,
                characterId: member.characterId,
                allStats: member.allStats,
                medals: member.medals,
                playerWeapons: member.extended.weapons,
                level: member.player.characterLevel,
                class: member.player.characterClass
              };
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

    $scope.suggestRecentPlayers = function () {
      if (angular.isUndefined($scope.recentPlayers)) {
        $scope.recentPlayers = {};
        angular.forEach($scope.fireteam[0].otherCharacters, function (character) {
          getActivitiesFromChar($scope, $scope.fireteam[0], character);
        });
      }
    };

    var sendAnalytic = function (event, cat, label) {
      $analytics.eventTrack(event, {
        category: cat,
        label: label
      });
    };

    $scope.getWeaponTitle = function (title) {
      switch (title) {
        case 'weaponKillsGrenade':
          return 'Grenade';
          break;
        case 'weaponKillsMelee':
          return 'Melee';
          break;
        case 'weaponKillsSuper':
          return 'Super';
          break;
      }
    };

    $scope.toggleEdit = function (player) {
      $scope.suggestRecentPlayers();
      player.isEditing = !player.isEditing;
    };

    if (angular.isObject(fireTeam)) {
      $scope.fireteam = fireTeam;
      $cookieStore.put('savedPlatform', ($routeParams.platformName === 'ps'));
      if (angular.isDefined($scope.fireteam[0])) {
        $scope.platformValue = $scope.fireteam[0].membershipType === 2;

        searchFireteam($scope, $scope.fireteam[0], 0, $scope.fireteam[0].membershipType, true);
        if (angular.isDefined($scope.fireteam[0].teamFromParams)){
          $scope.fireteam.push($scope.fireteam[0].teamFromParams[0]);
          $scope.fireteam.push($scope.fireteam[0].teamFromParams[1]);
          searchFireteam($scope, $scope.fireteam[1], 1, $scope.fireteam[1].membershipType, true);
          searchFireteam($scope, $scope.fireteam[2], 2, $scope.fireteam[2].membershipType, true);
        }
      }
    } else if (angular.isString(fireTeam)) {
      $scope.status = fireTeam;
    }
  });
