'use strict';

function setUser(currentAccount, name, platform) {
  return currentAccount.getAccount(name, platform)
    .then(function (player) {
      return [player];
    });
}

function getFromParams(currentAccount, $route) {
  if (angular.isDefined($route.current.params.playerName)) {
    var platform = $route.current.params.platform === 'xbox' ? 1 : 2;
    return setUser(currentAccount, $route.current.params.playerName, platform);
  }
}

function getAllFromParams(currentAccount, $route) {
  if (angular.isDefined($route.current.params.playerOne)) {
    var platform = $route.current.params.platform === 'xbox' ? 1 : 2;
    return currentAccount.getAccount($route.current.params.playerOne, platform)
      .then(function (player) {
        player.teamFromParams = true;
        return currentAccount.getAccount($route.current.params.playerTwo, platform)
        .then(function (playerTwo) {
            return currentAccount.getAccount($route.current.params.playerThree, platform)
            .then(function (playerThree) {
              return [player, playerTwo, playerThree];
            });
        });
      });
  }
}

function getDeej() {

}


angular
  .module('trialsReportApp', [
    'ngAnimate', 'ngCookies',
    'ngResource', 'ngRoute',
    'ngSanitize', 'ngTouch',
    'ui.bootstrap', 'angular-loading-bar',
    'angulartics', 'angulartics.google.analytics',
    'LocalStorageModule', 'toastr',
    'angularHelpOverlay', 'angular.filter',
    'picardy.fontawesome', 'timer'
  ]).config(window.$QDecorator)
  .factory('requestUrl', function () {
    return {
      //url : 'http://localhost:63294/Platform/'
      url: '/bungie/'
    };
  })
  .config(function ($routeProvider, $httpProvider, $compileProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam: getDeej
        }
      })
      .when('/:platform/:playerName', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          fireTeam: getFromParams
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
          fireTeam: getAllFromParams
        }
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('!');
    $httpProvider.useApplyAsync(true);
    $compileProvider.debugInfoEnabled(false);
  }).service('locationChanger', ['$location', '$route', '$rootScope', function ($location, $route, $rootScope) {

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
      if(doesReplace){
        $location.path(url).replace();
      }
      else {
        $location.path(url || '/');
      }
    };
  }]);
