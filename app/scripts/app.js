'use strict';

angular
  .module('trialsReportApp', [
    'ngAnimate', 'ngCookies',
    'ngResource', 'ngRoute',
    'ngSanitize', 'ngTouch',
    'ui.bootstrap', 'angular-loading-bar',
    'angulartics', 'angulartics.google.analytics',
    'LocalStorageModule', 'toastr',
    'angularHelpOverlay', 'angular.filter'
  ]).config( window.$QDecorator )
  .factory('requestUrl', function() {
    return {
      //url : 'http://localhost:63294/Platform/'
      url: '/bungie/'
    };
  })
  .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
        });
      }
      return original.apply($location, [path]);
    };
  }])
  .config(function ($routeProvider, $httpProvider, $compileProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam:getDeej
        }
      })
      .when('/:platform/:playerName', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam:getFromParams
          //bungieStatus:function($location, $http, requestUrl){
            //$http({method:'GET', url: requestUrl.url + 'GlobalAlerts/'}).then(function(result) {
            //  if(result.data.Response.length > 0){
            //    return result.data.Response[0].AlertHtml;
            //  }
            //});
          //}
        }
      })
      .when('/:platform/:playerOne/:playerTwo/:playerThree', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam:getAllFromParams
        }
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $httpProvider.useApplyAsync(true);
    $compileProvider.debugInfoEnabled(false);
  });

function getFromParams(currentAccount, $route, localStorageService) {
  if (angular.isDefined($route.current.params.playerName)){
    var platform = $route.current.params.platform === 'xbox' ? 1 : 2;
    return setUser(currentAccount, $route.current.params.playerName, platform);
  }
}

function getAllFromParams(currentAccount, $route, $q) {
  if (angular.isDefined($route.current.params.playerOne)){
    var platform = $route.current.params.platform === 'xbox' ? 1 : 2;
    return currentAccount.getAccount($route.current.params.playerOne, platform)
      .then(function (player) {
        player.teamFromParams = [$route.current.params.playerTwo, $route.current.params.playerThree];
        return player;
      });
  }
}

function setUser(currentAccount, name, platform) {
  return currentAccount.getAccount(name, platform)
    .then(function (player) {
    //  if (!angular.isObject(player)) {
    //    $interval(function () {
    //      $scope.helpOverlay = true;
    //    }, 1000);
    //  }
      return player;
    });
}

function getDeej(currentAccount) {
  return currentAccount.getAccount("Deej BNG", 1)
    .then(function (player) {
      player.isDeej = true;
      return player;
    });
}

