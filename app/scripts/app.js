'use strict';

function setUser(currentAccount, name, platform) {
  var url = '/Platform/Destiny/SearchDestinyPlayer/' + platform + '/' + name + '/';
  return currentAccount.getAccount(url)
    .then(function (player) {
      player.searched = true;
      var segments = location.hostname.split('.');
      var subdomain = segments.length>2?segments[segments.length-3].toLowerCase():null;
        player.myProfile = subdomain === 'my';
      return currentAccount.getPlayerCard(player)
        .then(function (player) {
          return [player];
        });
    });
}

function getFromParams(currentAccount, $route) {
  if (angular.isDefined($route.current.params.playerName)) {
    var platform = $route.current.params.platformName === 'xbox' ? 1 : 2;
    return setUser(currentAccount, $route.current.params.playerName, platform);
  }
}

function getAllFromParams($route, currentAccount, $q) {
  if (angular.isDefined($route.current.params.playerOne)) {
    var platform = $route.current.params.platformName === 'xbox' ? 1 : 2;
    var params = $route.current.params;
    var url = 'http://api.destinytrialsreport.com/SearchDestinyPlayer/' + platform + '/';

    var getPlayer = function (url, params) {
      return currentAccount.getAccount(url + params.playerOne)
        .then(function (result) {
          var player = result;
          player.searched = true;
          return player;
        });
      },
      teammatesInParallel = function (player) {
        var methods = [
          currentAccount.getPlayerCard(player),
          currentAccount.getAccount(url + params.playerTwo),
          currentAccount.getAccount(url + params.playerThree)
        ];
        return $q.all(methods);
      },
      returnPlayer = function (results) {
        var player = results[0];
        player.fireTeam = [results[1], results[2]];
        return [player];
      },
      reportProblems = function (fault) {
        console.log(String(fault));
      };
    return getPlayer(url, params)
      .then(teammatesInParallel)
      .then(returnPlayer)
      .catch(reportProblems);
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
    'matchMedia',
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
      html: 'true',
      placement: 'center'
    });
  })
  .config(function ($popoverProvider) {
    angular.extend($popoverProvider.defaults, {
      animation: false,
      container: 'body',
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
  }])
  .filter('secondsToDateTime', [function() {
    return function(seconds) {
      return new Date(1970, 0, 1).setSeconds(seconds || 0);
    };
}]);
