var app = angular.module('trialsReportApp');

app.service('api', [
  '$http',
  'util',

  function ($http, util) {
    return new function () {
      var BASE_URL = '/api';
      var ENDPOINTS = {
        searchForPlayer: '/SearchDestinyPlayer/{platform}/{name}',
        trialsStats: '/trialsStats/{platform}/{membershipId}/{characterId}'
      };

      this.searchForPlayer = function(platform, name) {
        return this.get(ENDPOINTS.searchForPlayer, {
          platform: platform,
          name: name
        });
      };

      this.trialsStats = function(platform, membershipId, characterId) {
        return this.get(ENDPOINTS.activityHistory, {
          platform: platform,
          membershipId: membershipId,
          characterId: characterId
        });
      };

      this.get = function(endpoint, tokens) {
        return $http.get(BASE_URL + util.buildUrl(endpoint, tokens));
      };
    };
  }
]);
