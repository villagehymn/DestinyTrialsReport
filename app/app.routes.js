'use strict';

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
        templateUrl: 'components/home/home.html',
        controller: 'homeController',
        resolve: {
          config: gggWeapons
        }
      })
      .when('/:platformName/:playerName', {
        templateUrl: 'components/home/home.html',
        controller: 'homeController',
        resolve: {
          config: getFromParams
        }
      })
      .when('/:platformName/:playerOne/:playerTwo/:playerThree', {
        templateUrl: 'components/home/home.html',
        controller: 'homeController',
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
  }]);
