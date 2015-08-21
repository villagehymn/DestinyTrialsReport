'use strict';

function getTeammates($scope, playerCard, locationChanger, fireTeam) {
  if (fireTeam) {
    if ($scope.subdomain) {
      var charCount = 1;
      angular.forEach(fireTeam, function (player) {
        if (player.characterId !== $scope.fireteam[0].characterId) {
          player.myProfile = true;
          playerCard.getPlayerCard(player).then(function (teammate) {
            $scope.$evalAsync( $scope.fireteam[charCount] = teammate );
            charCount++;
          });
        }
      });
    } else {
      angular.forEach(fireTeam, function (player) {
        player.fireTeam = fireTeam;
        playerCard.getTeammate(player).then(function (teammate) {
          $scope.fireteam.push(teammate);
          if ($scope.fireteam[0] && $scope.fireteam[1] && $scope.fireteam[2]) {
            if ($scope.fireteam[2].membershipId) {
              var platformUrl = $scope.platformValue ? '/ps/' : '/xbox/';
              locationChanger.skipReload()
                .withoutRefresh(platformUrl + $scope.fireteam[0].name + '/' +
                $scope.fireteam[1].name + '/' + $scope.fireteam[2].name, true);
            }
          }
        });
      });
    }
  } else {
    $scope.fireteam.push({name: 'Enter Player Name', invalidResult: true}, {name: 'Enter Player Name', invalidResult: true});
  }
}

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
  .controller('MainCtrl', function ($scope, $routeParams, fireTeam, subDomain, currentAccount, $analytics, $location, locationChanger, $localStorage, playerCard, $sce) {
    $scope.subdomain = subDomain.name === 'my';
    $scope.currentMap = DestinyTrialsDefinitions[270739640];
    $scope.timerRunning = true;
    $scope.$storage = $localStorage.$default({
      platform: true
    });

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
      'Site Developer': 'Hey! We made this site, so more than likely we are looking you up too...',
      'Site Donator': 'Part of an amazing few who\'ve help keep this site running'
    };

    $scope.headerPartial = 'views/shared/header.html';
    $scope.footerPartial = 'views/shared/footer.html';
    $scope.playerPartial = 'views/fireteam/player.html';
    $scope.statPartial = 'views/fireteam/stats.html';
    $scope.infoPartial = 'views/fireteam/info.html';

    $scope.mapModal = {
      content: $sce.trustAsHtml(
        '<div class="map-modal">' +
          '<div class="map-modal__intro" style="background-image: url(\'' + $scope.currentMap.headerImage + '\')">' +
            '<div class="map-modal__title">' + $scope.currentMap.activityName + '</div>' +
          '</div>' +
          '<div class="map-modal__heatmap">' +
            '<img src="' + $scope.currentMap.heatmapImage + '" class="img-responsive" alt="Heatmap" />' +
          '</div>' +
        '</div>'
      )
    };

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

    if ($routeParams.playerName) {
      $scope.searchedPlayer = $routeParams.playerName;
    }

    if ($routeParams.platformName) {
      $scope.platformValue = $routeParams.platformName === 'ps';
    } else {
      $scope.platformValue = $scope.$storage.platform;
    }

    $scope.searchPlayerbyName = function (name, platform, index, includeFireteam) {
      if (angular.isDefined(name)) {
        if (includeFireteam) {
          $location.path((platform ? '/ps/' : '/xbox/') + name);
        } else {
          getAccountByName(name, (platform ? 2 : 1), index);
          sendAnalytic('loadedPlayer', 'name', name);
          sendAnalytic('loadedPlayer', 'platform', (platform ? 2 : 1));
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

    $scope.refreshInventory = function (fireteam) {
      angular.forEach(fireteam, function (player, index) {
        playerCard.refreshInventory($scope.fireteam[index]).then(function (teammate) {
          $scope.$evalAsync( $scope.fireteam[index] = teammate );
        });
      });
    };

    $scope.setRecentPlayer = function (player, index, getFireteam) {
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

    if (angular.isObject(fireTeam)) {
      $scope.fireteam = fireTeam;
      $scope.$storage.platform = ($routeParams.platformName === 'ps');
      if (angular.isDefined($scope.fireteam[0])) {
        $scope.platformValue = $scope.fireteam[0].membershipType === 2;
        if ($scope.subdomain) {
          getTeammates($scope, playerCard, locationChanger, $scope.fireteam[0].otherCharacters);
        } else {
          if ($scope.fireteam[0].searched){
            getTeammates($scope, playerCard, locationChanger, $scope.fireteam[0].fireTeam);
          } else if ($scope.fireteam[0].teamFromParams) {
            $scope.fireteam[0].inUrl = true;
            playerCard.getPlayerCard($scope.fireteam[0]).then(function (player) {
              $scope.fireteam[0] = player;
              angular.forEach($scope.fireteam[0].teamFromParams, function (player, index) {
                player.inUrl = true;
                player.mainPlayerActivity = $scope.fireteam[0].recentActivity;
                player.mainPlayerFireteam = $scope.fireteam[0].fireTeam;
                $scope.fireteam.push(player);
                playerCard.getPlayerCard(player).then(function (teammate) {
                  $scope.fireteam[index + 1] = teammate;
                });
              });
            });
          }
        }
      } else {
        $scope.fireteam = null;
      }
    } else if (angular.isString(fireTeam)) {
      $scope.status = fireTeam;
    }
  });
