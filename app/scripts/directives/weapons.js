'use strict';

angular.module('trialsReportApp')
  .directive('weaponNodes', function() {
    return {
      restrict: 'A',
      scope: {
        weapons: '=weaponNodes'
      },
      templateUrl: 'views/directives/weapons.html'
    };
  });
