var app = angular.module('trialsReportApp');

app.service('guardianGG', [
  '$http',
  'util',

  function ($http, util) {
    return new function () {
      var BASE_URL = 'http://api.guardian.gg';
      var ENDPOINTS = {
        getElo: '/elo/{membershipId}',
        getFireteam: '/ggg/fireteam/{mode}/{membershipId}',
        getTeam: '/ggg/dtr/{membershipIdArray}'
      };

      this.getElo = function(membershipId) {
        return this.get(ENDPOINTS.getElo, {
          membershipId: membershipId
        });
      };

      this.getFireteam = function(membershipId) {
        return this.get(ENDPOINTS.getFireteam, {
          mode: mode,
          membershipId: membershipId
        });
      };

      this.getTeam = function(membershipIdArray) {
        return this.get(ENDPOINTS.getTeam, {
          membershipIdArray: membershipIdArray
        });
      };

      this.get = function(endpoint, tokens) {
        return $http.get(BASE_URL + util.buildUrl(endpoint, tokens));
      };
    };
  }
]);