'use strict';

angular
  .module('trialsReportApp', [
    'ngAnimate', 'ngCookies',
    'ngResource', 'ngRoute',
    'ngSanitize', 'ngTouch',
    'ui.bootstrap', 'angular-loading-bar',
    'angulartics', 'angulartics.google.analytics',
    'LocalStorageModule', 'toastr',
    'zeroclipboard', 'angularHelpOverlay',
    'angular.filter'
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
          bungieStatus:function($location, $http, requestUrl){
            $http({method:'GET', url: requestUrl.url + 'GlobalAlerts/'}).then(function(result) {
              if(result.data.Response.length > 0){
                return result.data.Response[0].AlertHtml;
              }
            });
          }
        }
      })
      .when('/:platform/:playerName', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          bungieStatus:function($location, $http, requestUrl){
            $http({method:'GET', url: requestUrl.url + 'GlobalAlerts/'}).then(function(result) {
              if(result.data.Response.length > 0){
                return result.data.Response[0].AlertHtml;
              }
            });
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
  .config(['uiZeroclipConfigProvider', function(uiZeroclipConfigProvider) {

    uiZeroclipConfigProvider.setZcConf({
      swfPath: '/lib/ZeroClipboard.swf'
    });

  }]);
