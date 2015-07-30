'use strict';

angular.module('trialsReportApp')
  .factory('trialsStats', function ($http, requestUrl) {
    var path = requestUrl.url;

    var getData = function (membershipType, membershipId, characterId) {
      return $http({
        method: 'GET',
        url: path + 'Destiny/Stats/' + membershipType + '/' + membershipId + '/' + characterId + '/?modes=14'
      }).then(function (result) {
        return result.data.Response.trialsOfOsiris.allTime;
      });
    };

    return {
      getData: getData
    };
  });
