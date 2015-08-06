'use strict';

angular.module('trialsReportApp')
  .factory('trialsStats', function ($http, requestUrl) {
    var path = requestUrl.url;

    var getData = function (membershipType, membershipId, characterId) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/trialsStats/' + membershipType + '/' + membershipId + '/' + characterId
      }).then(function (result) {
        return result.data;
      });
    };

    return {
      getData: getData
    };
  });
