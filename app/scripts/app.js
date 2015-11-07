'use strict';

function getFromParams(trialsReport, inventoryService, guardianFactory, toastr, bungie, $route, $q) {
  var params = $route.current.params;
  var name = params.playerName || params.playerOne;
  if (angular.isDefined(name)) {
    var platform = params.platformName === 'xbox' ? 1 : 2;
    var subdomain = getSubdomain();

    var getPlayer = function () {
        return trialsReport.getAccount(platform, params.playerName)
          .then(function (result) {
            if (result) {
              var player = result;
              player.searched = true;
              if (subdomain === 'my') {
                return trialsReport.getCharacters(
                  player.membershipType,
                  player.membershipId,
                  params.playerName
                );
              } else {
                return guardianFactory.getFireteam('14', player.membershipId)
                  .then(function (result) {
                    if (result && result.data.length > 0) {
                      return result.data
                    } else {
                      return trialsReport.getRecentActivity(player)
                        .then(function (result) {
                          return getFireteam(result);
                      })
                    }
                })
              }
            } else {
              return false;
            }
          });
      },
      getFireteam = function (activities) {
        if (angular.isUndefined(activities[0])) {
          toastr.error('No Trials matches found for player', 'Error');
          return activities;
        }
        return bungie.getPgcr(activities[0].activityDetails.instanceId)
          .then(function(result) {
            var fireteam = [];
            _.each(result.data.Response.data.entries, function(player) {
              if (player.standing === activities[0].values.standing.basic.value) {
                fireteam.push({
                  membershipType: player.player.destinyUserInfo.membershipType,
                  membershipId: player.player.destinyUserInfo.membershipId,
                  name: player.player.destinyUserInfo.displayName
                })
              }
            });
            return fireteam;
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
      teammatesFromChars = function (player) {
        if (player) {
          var methods = [];
          angular.forEach(player.characters, function (character) {
            methods.push(character);
          });
          return $q.all(methods);
        } else {
          return false;
        }
      },
      teammatesFromRecent = function (players) {
        if (players && players[0] && !players[0].characterInfo) {
          var playerOne = _.find(players, function(player) {
            return angular.lowercase(player.name) === angular.lowercase(name);
          });
          var methods = [trialsReport.getCharacters(
            playerOne.membershipType,
            playerOne.membershipId,
            playerOne.name
          )];
          angular.forEach(players, function (player) {
            if (angular.lowercase(player.name) !== angular.lowercase(name)) {
              methods.push(trialsReport.getCharacters(
                player.membershipType,
                player.membershipId,
                player.name
              ));
            }
          });
          return $q.all(methods);
        } else if (players && players.characterInfo) {
          return [players]
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
          return {
            fireteam: [results[0],results[1], results[2]],
            subdomain: subdomain,
            updateUrl: params.playerName
          };
        } else {
          return {
            fireteam: [],
            subdomain: subdomain
          };
        }
      },
      reportProblems = function (fault) {
        console.log(String(fault));
      };
    if (!$route.current.params.preventLoad) {
      if (params.playerOne) {
        return teammatesFromParams()
          .then(getInventory)
          .then(returnPlayer)
          .catch(reportProblems);
      } else if (subdomain === 'my') {
        return getPlayer()
          .then(teammatesFromChars)
          .then(getInventory)
          .then(returnPlayer)
          .catch(reportProblems);
      } else {
        return getPlayer()
          .then(teammatesFromRecent)
          .then(getInventory)
          .then(returnPlayer)
          .catch(reportProblems);
      }
    }
  }
}

function getSubdomain() {
  var segments = location.hostname.split('.');
  return segments.length>2?segments[segments.length-3].toLowerCase():null;
}

function gggWeapons($localStorage, guardianFactory) {
  var platformNumeric = $localStorage.platform ? 2 : 1;
  return guardianFactory.getWeapons(
    platformNumeric
  ).then(function (result) {
      return {
        gggWeapons: result,
        platformNumeric: platformNumeric,
        subdomain: getSubdomain()
      };
    });
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

      $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          config: gggWeapons
        }
      })
      .when('/:platformName/:playerName', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          config: getFromParams
        }
      })
      .when('/:platformName/:playerOne/:playerTwo/:playerThree', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          config: getFromParams
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
          lastRoute.params.preventLoad = true;
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
