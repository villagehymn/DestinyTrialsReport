'use strict';

angular.module('trialsReportApp')
  .directive('trialsHistory', function() {
    return {
      restrict: 'A',
      scope: {
        activities: '=trialsHistory',
        kd: '=playerKd'
      },
      link: function ($scope, element, attrs) {
        var factor = -60,
            range = 1.5,
            unit = '%';

        $scope.calcGraphPoint = function (matchKd) {
          var x = 0;
          if (matchKd < $scope.kd) {
            x = Math.max(-range, matchKd - $scope.kd);
          } else {
            x = Math.min(range, matchKd - $scope.kd);
          }
          var value = x * factor + unit;
          var translateY = 'translateY(' + value + '); ';
          var style = '';
          angular.forEach(['transform: ', '-webkit-transform: ', '-ms-transform: '], function(key) {
            style += key + translateY;
          });
          return style;
        };
      },
      templateUrl: 'views/directives/stats.html'
    };
});
