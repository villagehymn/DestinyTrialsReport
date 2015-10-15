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
          {name: 'Enter Player Name', invalidResult: true},
          {name: 'Enter Player Name', invalidResult: true}
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
        {name: 'Enter Player Name', invalidResult: true}
      );
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

function getContentOffset(innerWidth) {
  var contentOffset = Math.round(innerWidth * 0.85);
  return contentOffset > 420 ? 420 : contentOffset
}


angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $routeParams, fireTeam, subDomain, locationChanger, $localStorage, screenSize, currentAccount, trialsStats, $window, $timeout) {
    $scope.currentMap = DestinyCrucibleMapDefinition[3848655103];
    $scope.subdomain = subDomain.name === 'my';
    $scope.$storage = $localStorage.$default({
      platform: true
    });

    $scope.DestinyCrucibleMapDefinition = DestinyCrucibleMapDefinition;
    $scope.DestinyHazardDefinition = DestinyHazardDefinition;
    $scope.DestinyMedalDefinition = DestinyMedalDefinition;
    $scope.DestinyWeaponDefinition = DestinyWeaponDefinition;

    $scope.weaponKills = weaponKills;
    $scope.screenSize = {};
    $scope.screenSize.xs = screenSize.on('xs', function (match) { $scope.screenSize.xs = match; });
    $scope.screenSize.sm = screenSize.on('sm', function (match) { $scope.screenSize.sm = match; });
    $scope.screenSize.md = screenSize.on('md', function (match) { $scope.screenSize.md = match; });
    $scope.screenSize.lg = screenSize.on('lg', function (match) { $scope.screenSize.lg = match; });

    $scope.statNamesByHash = statNamesByHash;

    var controlEl = angular.element(document.querySelector('#controls'));
    var contentEl = angular.element(document.querySelector('#content'));
    //if ($scope.screenSize.xs || $scope.screenSize.sm) {
      //controlEl.wrap('<div class="snap-drawers"></div>')
      //  .wrap('<snap-drawer class="snap-drawer snap-drawer-left"></snap-drawer>');
      //contentEl.wrap('<snap-content id="snap-content" style="background-color: #fff" snap-options="snapOpts"></snap-content>');
      //angular.element(document.querySelector('#snap-content')).prepend(
      //  '<snap-dragger>' +
      //    '<button class="btn btn-icon" snap-toggle>' +
      //      '<i class="material-icons">&#xE5D2;</i>' +
      //    '</button>' +
      //  '</snap-dragger>'
      //);
    //}

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
