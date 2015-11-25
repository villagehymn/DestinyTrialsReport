'use strict';

var app = angular.module('trialsReportApp');

app.service('api', [
  '$http',
  'util',

  function ($http, util) {
    return new function () {
      var BASE_URL = '';
      var ENDPOINTS = {
        supporterStatus: '/supporterStatus/{membershipId}'
      };

      this.checkSupporterStatus = function(membershipId) {
        return this.get(ENDPOINTS.supporterStatus, {
          membershipId: membershipId
        });
      };

      this.get = function(endpoint, tokens) {
        return $http.get(BASE_URL + util.buildUrl(endpoint, tokens));
      };
    };
  }
]);
