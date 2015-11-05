var app = angular.module('trialsReportApp');

app.service('bungie', [
  '$http',
  'util',

  function ($http, util) {
    return new function () {
      var BASE_URL = '/Platform/Destiny';
      var ENDPOINTS = {
        account: '/{platform}/Account/{membershipId}/',
        inventory: '/{platform}/Account/{membershipId}/Character/{characterId}/Inventory/?definitions=true&lc={locale}',
        activityHistory: '/Stats/ActivityHistory/{platform}/{membershipId}/{characterId}/?mode={mode}&count={count}',
        pgcr: '/Stats/PostGameCarnageReport/{instanceId}/'
      };

      this.getPgcr = function(instanceId) {
        return this.get(ENDPOINTS.pgcr, {
          instanceId: instanceId
        });
      };

      this.getAccount = function(platform, membershipId) {
        return this.get(ENDPOINTS.account, {
          platform: platform,
          membershipId: membershipId
        });
      };

      this.getInventory = function(platform, membershipId, characterId) {
        return this.get(ENDPOINTS.inventory, {
          platform: platform,
          membershipId: membershipId,
          characterId: characterId
        });
      };

      this.getActivityHistory = function(platform, membershipId, characterId, mode, count) {
        return this.get(ENDPOINTS.activityHistory, {
          platform: platform,
          membershipId: membershipId,
          characterId: characterId,
          mode: mode,
          count: count
        });
      };

      this.getInventory = function(platform, membershipId, characterId) {
        return this.get(ENDPOINTS.inventory, {
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
