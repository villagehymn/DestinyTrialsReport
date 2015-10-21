'use strict';

angular.module('trialsReportApp')
  .directive('armor', function() {
    return {
      restrict: 'A',
      scope: {
        exoticArmor: '=armor',
        hasExotic: '=hasExotic'
      },
      templateUrl: 'views/directives/armor.html'
    };
  });
