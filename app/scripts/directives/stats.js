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
  }).directive('buildStats', function() {
    return {
      restrict: 'A',
      scope: {
        stats: '=buildStats'
      },
      link: function ($scope, element, attrs) {
        $scope.statPopover = function (stat) {
          var popover;

          if (stat.tier) {
            popover = {content:'Tier ' + stat.tier + ' — ' + + stat.value + ' / 300 (' + stat.percentage + '%)' + '<br>' + 'Cooldown: ' + stat.cooldown}
          } else {
            popover = {content: stat.name + ': ' + (stat.value / 10) * 100 + '%'}
          }
          return popover;
        };
      },
      templateUrl: 'views/directives/build.html'
    };
  });
