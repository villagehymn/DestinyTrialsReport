'use strict';

function setUser(currentAccount, name, platform, playerCard) {
  return currentAccount.getAccount(name, platform)
    .then(function (player) {
      player.searched = true;
      var segments = location.hostname.split('.');
      var subdomain = segments.length>2?segments[segments.length-3].toLowerCase():null;
      player.myProfile = subdomain === 'my';
      return playerCard.getPlayerCard(player)
        .then(function (player) {
          return [player];
        });
    });
}

function getFromParams(currentAccount, $route, playerCard) {
  if (angular.isDefined($route.current.params.playerName)) {
    var platform = $route.current.params.platformName === 'xbox' ? 1 : 2;
    return setUser(currentAccount, $route.current.params.playerName, platform, playerCard);
  }
}

function getAllFromParams($http, $route) {
  if (angular.isDefined($route.current.params.playerOne)) {
    var platform = $route.current.params.platformName === 'xbox' ? 1 : 2;
    var params = $route.current.params;
    return $http({
      method: 'GET',
      url: 'http://api.destinytrialsreport.com/getAccounts/' + platform + '/' + params.playerOne + '/' + params.playerTwo + '/' + params.playerThree
    }).then(function (players) {
      return [players.data];
    });
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
    'angular-carousel',
    'angular-loading-bar',
    'mgcrea.ngStrap.popover',
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngTouch',
    'toastr',
    'ui.bootstrap.tpls',
    'ui.bootstrap.progressbar',
    'ui.bootstrap.tabs'
  ])
  .config(window.$QDecorator)
  .config(function ($popoverProvider) {
    angular.extend($popoverProvider.defaults, {
      container: 'body',
      placement: 'auto',
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
          fireTeam: getAllFromParams,
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
  }]);
