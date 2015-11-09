'use strict';

var app = angular.module('trialsReportApp');

app.service('guardianGG', [
  '$http',
  'util',

  function ($http, util) {
    return new function () {
      var BASE_URL = '/ggg';
      var ENDPOINTS = {
        getElo: '/elo/{membershipId}',
        getFireteam: '/fireteam/{mode}/{membershipId}',
        getTeam: '/dtr/{membershipIdArray}',
        getWeapons: '/weapon/top?mode=14&platform={platform}&start={start}'
      };

      this.getElo = function(membershipId) {
        return this.get(ENDPOINTS.getElo, {
          membershipId: membershipId
        });
      };

      this.getFireteam = function(mode, membershipId) {
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

      this.getWeapons = function(platform, start) {
        return this.get(ENDPOINTS.getWeapons, {
          platform: platform,
          start: start
        });
      };

      this.get = function(endpoint, tokens) {
        return $http.get(BASE_URL + util.buildUrl(endpoint, tokens));
      };
    };
  }
]);
