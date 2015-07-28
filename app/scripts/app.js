'use strict';

function setUser(currentAccount, name, platform) {
  return currentAccount.getAccount(name, platform)
    .then(function (player) {
      return player;
    });
}

function getFromParams(currentAccount, $route) {
  if (angular.isDefined($route.current.params.playerName)){
    var platform = $route.current.params.platform === 'xbox' ? 1 : 2;
    return setUser(currentAccount, $route.current.params.playerName, platform);
  }
}

function getAllFromParams(currentAccount, $route) {
  if (angular.isDefined($route.current.params.playerOne)){
    var platform = $route.current.params.platform === 'xbox' ? 1 : 2;
    return currentAccount.getAccount($route.current.params.playerOne, platform)
      .then(function (player) {
        player.teamFromParams = [$route.current.params.playerTwo, $route.current.params.playerThree];
        return player;
      });
  }
}

function getDeej() {
  //    Method for outputting log as stringified json
  //    var cache = [];
  //    console.log(JSON.stringify(player, function(key, value) {
  //      if (typeof value === 'object' && value !== null) {
  //        if (cache.indexOf(value) !== -1) {
  //          // Circular reference found, discard key
  //          return;
  //        }
  //        // Store value in our collection
  //        cache.push(value);
  //      }
  //      return value;
  //    }));
  //    cache = null;
  return {
    'id': '4611686018429501017',
    'name': 'DeeJ BNG',
    'membershipId': '4611686018429501017',
    'membershipType': 1,
    'characterId': '2305843009292996472',
    'className': 'Warlock',
    'classType': 2,
    'otherCharacters': [{
      'id': '4611686018429501017',
      'name': 'DeeJ BNG',
      'classType': 2,
      'className': 'Warlock',
      'membershipId': '4611686018429501017',
      'membershipType': 1,
      'characterId': '2305843009292996472',
      'level': 32,
      'int': 67,
      'dis': 194,
      'str': 245,
      'grimoire': 2685,
      'background': ['http://bungie.net/common/destiny_content/icons/0fc2957b437530a6fec4b241257089bd.jpg'],
      'emblem': 'http://bungie.net/common/destiny_content/icons/ca7a9bb4a45b7d33a4848577a67cfa33.jpg'
    }],
    'level': 32,
    'int': 67,
    'dis': 194,
    'str': 245,
    'grimoire': 2685,
    'background': ['http://bungie.net/common/destiny_content/icons/0fc2957b437530a6fec4b241257089bd.jpg'],
    'emblem': 'http://bungie.net/common/destiny_content/icons/ca7a9bb4a45b7d33a4848577a67cfa33.jpg',
    'isDeej': true
  };
}


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
