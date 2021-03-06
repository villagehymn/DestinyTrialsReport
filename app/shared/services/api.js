'use strict';

var app = angular.module('trialsReportApp');

app.service('api', [
  '$http',
  'util',

  function ($http, util) {
    return new function () {
      var BASE_URL = '';
      var ENDPOINTS = {
        supporterStatus: '/supporterStatus/{membershipId}',
        lighthouseCount: '/api/lighthouseAll/{membershipId}',
        opponents: '/api/getOpponents/{membershipId}',
        topWeapons: '/api/topWeapons/{membershipId}',
        recentTeammates: '/api/recentTeammates/{membershipId}',
        previousMatches: '/api/previousMatches/{membershipId}',
        teamByMatch: '/api/teamByMatch/{instanceId}',
        trialsFirst: '/api/trialsFirst'
      };

      this.checkSupporterStatus = function(membershipId) {
        return this.get(ENDPOINTS.supporterStatus, {
          membershipId: membershipId
        });
      };

      this.lighthouseCount = function(membershipId) {
        return this.get(ENDPOINTS.lighthouseCount, {
          membershipId: membershipId
        });
      };

      this.getOpponents = function(membershipId) {
        return this.get(ENDPOINTS.opponents, {
          membershipId: membershipId
        });
      };

      this.topWeapons = function(membershipId) {
        return this.get(ENDPOINTS.topWeapons, {
          membershipId: membershipId
        });
      };

      this.recentTeammates = function(membershipId) {
        return this.get(ENDPOINTS.recentTeammates, {
          membershipId: membershipId
        });
      };

      this.previousMatches = function(membershipId) {
        return this.get(ENDPOINTS.previousMatches, {
          membershipId: membershipId
        });
      };

      this.teamByMatch = function(instanceId) {
        return this.get(ENDPOINTS.teamByMatch, {
          instanceId: instanceId
        });
      };

      this.trialsFirst = function() {
        return this.get(ENDPOINTS.trialsFirst, {});
      };

      this.get = function(endpoint, tokens) {
        return $http.get(BASE_URL + util.buildUrl(endpoint, tokens));
      };
    };
  }
]);
