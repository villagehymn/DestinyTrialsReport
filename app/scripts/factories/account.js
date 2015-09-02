'use strict';

angular.module('trialsReportApp')
  .factory('currentAccount', function ($http, $filter, toastr, User) {
    var getAccount = function (url) {
      return $http({
        method: 'GET',
        url: url
      }).then(function (resultAcc) {
        if (resultAcc.data.Response.length < 1) {
          toastr.error('Player not found', 'Error');
          return;
        }
        var response = resultAcc.data.Response[0];
        return getCharacters(response.membershipType, response.membershipId, response.displayName);
      }).catch(function () {});
    };

    var getCharacters = function (membershipType, membershipId, name) {
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/' + membershipType + '/Account/' + membershipId + '/'
      }).then(function (resultChar) {
        var player = User.build(resultChar.data.Response.data, name, resultChar.data.Response.data.characters[0]);
        return player;
      }).catch(function () {});
    };

    var getActivities = function (account, count) {
      var aCount = count > 0 ? '&count='+ count : '&count=25';
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + account.characterInfo.characterId + '/?mode=14' + aCount
      }).then(function (resultAct) {
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          toastr.error('No Trials matches found for player', 'Error');
          return account;
        }
        return account.setActivities(account, activities);
      }).catch(function () {});
    };

    var getLastTwentyOne = function (account, character) {
      var allPastActivities = [];
      return $http({
        method: 'GET',
        url: '/Platform/Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + character.characterInfo.characterId + '/?mode=14&count=21'
      }).then(function (resultAct) {
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          return;
        }
        angular.forEach(activities.slice().reverse(), function (activity, index) {
          if (index % 5 === 0) {
            allPastActivities.push({
              'id': activity.activityDetails.instanceId,
              'standing': activity.values.standing.basic.value
            });
          }
        });
        return allPastActivities;
      }).catch(function () {});
    };

    return {
      getAccount: getAccount,
      getActivities: getActivities,
      getLastTwentyOne: getLastTwentyOne,
      getCharacters: getCharacters
    };
  });
