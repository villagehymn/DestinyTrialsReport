'use strict';

function getTeammates($scope, playerCard, locationChanger, mainPlayer) {
  if ($scope.subdomain) {
    getTeammatesFromCharacters($scope, playerCard, mainPlayer.otherCharacters);
  }
  else {
    if (mainPlayer.searched){
      getTeammatesFromHistory($scope, playerCard, locationChanger, mainPlayer.fireTeam);
    }
    else if (mainPlayer.teamFromParams) {
      getTeammatesFromParams($scope, playerCard);
    }
  }
}

function getTeammatesFromCharacters($scope, playerCard, fireTeam) {
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
}

function getTeammatesFromHistory($scope, playerCard, locationChanger, fireTeam) {
  if (fireTeam){
    angular.forEach(fireTeam, function (player) {
      player.fireTeam = fireTeam;
      playerCard.getTeammate(player).then(function (teammate) {
        $scope.fireteam.push(teammate);
        updateUrl($scope, locationChanger);
      });
    });
  }
  else {
    $scope.fireteam.push(
      {name: 'Enter Player Name', invalidResult: true},
      {name: 'Enter Player Name', invalidResult: true}
    );
  }
}

function getTeammatesFromParams($scope, playerCard) {
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

angular.module('trialsReportApp')
  .controller('MainCtrl', function ($scope, $routeParams, fireTeam, subDomain, locationChanger, $localStorage, playerCard, screenSize) {
    $scope.currentMap = DestinyTrialsDefinitions[257451727];
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
        getTeammates($scope, playerCard, locationChanger, $scope.fireteam[0]);
      } else {
        $scope.fireteam = null;
      }
    } else if (angular.isString(fireTeam)) {
      $scope.status = fireTeam;
    }
  });
