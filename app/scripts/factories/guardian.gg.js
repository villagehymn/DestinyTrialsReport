'use strict';

angular.module('trialsReportApp')
  .factory('guardianFactory', function (guardianGG) {

    var getElo = function (player) {
      return guardianGG.getElo(player.membershipId)
        .then(function (elo) {
          var elo = _.find(elo.data, function(arr){ return arr.mode == 14; });
          if (elo) {
            player.elo = elo.elo
          }
          return player;
        }).catch(function () {});
    };

    return {
      getElo: getElo
    };
  });
