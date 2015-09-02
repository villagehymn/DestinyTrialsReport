'use strict';

function getTeammates($scope, locationChanger, mainPlayer) {
  if ($scope.subdomain) {
    getTeammatesFromCharacters($scope, mainPlayer.characters);
  }
  else {
    if (mainPlayer.searched){
      getTeammatesFromHistory($scope, locationChanger, mainPlayer.fireTeam);
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
    $scope.fireteam.push(player);
    if (locationChanger){
      updateUrl($scope, locationChanger);
    }
  });
}

function getTeammatesFromHistory($scope, locationChanger, fireTeam) {
  if (fireTeam){
    addFireteamMember(fireTeam, $scope, locationChanger);
  }
  else {
    $scope.fireteam.push(
      {name: 'Enter Player Name', invalidResult: true},
      {name: 'Enter Player Name', invalidResult: true}
    );
  }
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
  .controller('MainCtrl', function ($scope, $routeParams, fireTeam, subDomain, locationChanger, $localStorage, screenSize, currentAccount, trialsStats) {
    $scope.currentMap = DestinyTrialsDefinitions[270739640];
    $scope.subdomain = subDomain.name === 'my';
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
      'Site Donator': 'Part of an amazing few who\'ve helped keep this site running'
    };

    $scope.screenSize = {};
    $scope.screenSize.xs = screenSize.on('xs', function (match) { $scope.screenSize.xs = match; });
    $scope.screenSize.sm = screenSize.on('sm', function (match) { $scope.screenSize.sm = match; });
    $scope.screenSize.md = screenSize.on('md', function (match) { $scope.screenSize.md = match; });
    $scope.screenSize.lg = screenSize.on('lg', function (match) { $scope.screenSize.lg = match; });

    $scope.suggestRecentPlayers = function () {
      if (angular.isUndefined($scope.recentPlayers)) {
        $scope.recentPlayers = {};
        angular.forEach($scope.fireteam[0].characters, function (character) {
          getActivitiesFromChar($scope, $scope.fireteam[0], character, currentAccount, trialsStats);
        });
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
