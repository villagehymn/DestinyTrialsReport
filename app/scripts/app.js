'use strict';

function getFromParams(trialsReport, inventoryService, toastr, bungie, $route, $q) {
  var params = $route.current.params;
  var name = params.playerName || params.playerOne;
  if (angular.isDefined(name)) {
    var platform = $route.current.params.platformName === 'xbox' ? 1 : 2;
    var segments = location.hostname.split('.');
    var subdomain = segments.length>2?segments[segments.length-3].toLowerCase():null;

    var getPlayer = function () {
        return trialsReport.getAccount(platform, params.playerName)
          .then(function (result) {
            if (result) {
              var player = result;
              player.searched = true;
              player.myProfile = subdomain === 'my';
              return trialsReport.getRecentActivity(player);
            } else {
              return false;
            }
          });
      },
      getFireteam = function (activities) {
        if (angular.isUndefined(activities)) {
          toastr.error('No Trials matches found for player', 'Error');
          return activities;
        }
        return bungie.getPgcr(activities[0].activityDetails.instanceId)
          .then(function(result) {
            return _.filter(result.data.Response.data.entries, function(player) {
              return player.standing === activities[0].values.standing.basic.value;
            });
          });

      },
      teammatesFromParams = function () {
        var methods = [
          trialsReport.getAccount(platform, params.playerOne),
          trialsReport.getAccount(platform, params.playerTwo),
          trialsReport.getAccount(platform, params.playerThree)
        ];
        return $q.all(methods);
      },
      teammatesFromRecent = function (players) {
        if (players) {
          var playerOne = _.find(players, function(player) {
            return angular.lowercase(player.player.destinyUserInfo.displayName) === angular.lowercase(name);
          });
          var methods = [trialsReport.getCharacters(
            playerOne.player.destinyUserInfo.membershipType,
            playerOne.player.destinyUserInfo.membershipId,
            playerOne.player.destinyUserInfo.displayName
          )];
          angular.forEach(players, function (player) {
            if (angular.lowercase(player.player.destinyUserInfo.displayName) !== angular.lowercase(name)) {
              methods.push(trialsReport.getCharacters(
                player.player.destinyUserInfo.membershipType,
                player.player.destinyUserInfo.membershipId,
                player.player.destinyUserInfo.displayName
              ));
            }
          });
          return $q.all(methods);
        } else {
          return false;
        }
      },
      getInventory = function (players) {
        var methods = [];
        angular.forEach(players, function (player) {
          methods.push(inventoryService.getInventory(player.membershipType, player));
        });
        return $q.all(methods);
      },
      returnPlayer = function (results) {
        if (results) {
          return [results[0],results[1], results[2]];
        } else {
          return [];
        }
      },
      reportProblems = function (fault) {
        console.log(String(fault));
      };
    if (params.playerOne) {
      return teammatesFromParams()
        .then(getInventory)
        .then(returnPlayer)
        .catch(reportProblems);
    } else {
      return getPlayer()
        .then(getFireteam)
        .then(teammatesFromRecent)
        .then(getInventory)
        .then(returnPlayer)
        .catch(reportProblems);
    }
  }
}

function checkStatus() {
  //return $http({
  //  method: 'GET',
  //  url: 'http://api.destinytrialsreport.com/GlobalAlerts'
  //}).then(function (result) {
  //  if(result.data.length > 0){
  //    return result.data[0].AlertHtml;
  //  }
  //});
}

angular
  .module('trialsReportApp', [
    'angulartics',
    'angulartics.google.analytics',
    'angular-loading-bar',
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.popover',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngStorage',
    'ngTouch',
    'toastr',
    'ui.bootstrap.tpls',
    'ui.bootstrap.progressbar',
    'ui.bootstrap.tabs'
  ])
  .config(window.$QDecorator)
  .config(function ($modalProvider) {
    angular.extend($modalProvider.defaults, {
      container: 'body',
      placement: 'center'
    });
  })
  .config(function ($popoverProvider) {
    angular.extend($popoverProvider.defaults, {
      animation: false,
      container: 'body',
      html: true,
      placement: 'auto top',
      trigger: 'hover'
    });
  })
  .config(function ($routeProvider, $httpProvider, $compileProvider, $locationProvider) {
    $.material.init();

    var segments = location.hostname.split('.');
    var subdomain = segments.length>2?segments[segments.length-3].toLowerCase():null;

      $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam: checkStatus,
          subDomain: function(){
            return {name: subdomain};
          }
        }
      })
      .when('/:platformName/:playerName', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          subDomain: function(){
            return {name: subdomain};
          },
          fireTeam: getFromParams
        }
      })
      .when('/:platformName/:playerOne/:playerTwo/:playerThree', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam: getFromParams,
          subDomain: function(){
            return {name: subdomain};
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $httpProvider.useApplyAsync(true);
    $compileProvider.debugInfoEnabled(false);
  })
  .service('locationChanger', ['$location', '$route', '$rootScope', function ($location, $route, $rootScope) {
    this.skipReload = function () {
      var lastRoute = $route.current;
      $rootScope.$on('$locationChangeSuccess', function () {
        if (angular.isUndefined($route.current.params.playerName)){
          $route.current = lastRoute;
        }
      });
      return this;
    };

    this.withoutRefresh = function (url, doesReplace) {
      if (doesReplace) {
        $location.path(url).replace();
      } else {
        $location.path(url || '/');
      }
    };
  }])
  .filter('secondsToDateTime', [function() {
    return function(seconds) {
      return new Date(1970, 0, 1).setSeconds(seconds || 0);
    };
  }])
  .filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
  });
