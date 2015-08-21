'use strict';

angular.module('trialsReportApp')
  .factory('trialsStats', function ($http) {
    var getData = function (player) {
      return $http({
        method: 'GET',
        url: 'http://api.destinytrialsreport.com/trialsStats/' + player.membershipType + '/' + player.membershipId + '/' + player.characterId
      }).then(function (result) {
        return result.data;
      });
    };

    return {
      getData: getData
    };
  });
