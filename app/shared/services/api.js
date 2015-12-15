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
        topWeapons: '/api/topWeapons/{membershipId}',
        previousMatches: '/api/previousMatches/{membershipId}'
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

      this.topWeapons = function(membershipId) {
        return this.get(ENDPOINTS.topWeapons, {
          membershipId: membershipId
        });
      };

      this.previousMatches = function(membershipId) {
        return this.get(ENDPOINTS.previousMatches, {
          membershipId: membershipId
        });
      };

      this.get = function(endpoint, tokens) {
        return $http.get(BASE_URL + util.buildUrl(endpoint, tokens));
      };
    };
  }
]);
