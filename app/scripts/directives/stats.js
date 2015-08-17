'use strict';

angular.module('trialsReportApp')
  .directive('trialsHistory', function() {
    return {
      restrict: 'A',
      scope: {
        activities: '=trialsHistory'
      },
      template: [
        '<!--<div ng-if="!activities">N/A</div>-->',
        '<div>' +
          '<i class="player-history__match"' +
            'ng-repeat="str in activities.slice().reverse() track by $index"' +
            'ng-class="str.standing === 0 ? \'player-history__match--win\' : \'player-history__match--loss\'"' +
            'data-title="{{str.dateAgo}}" data-content="K/D: {{str.kd}} with {{str.kills}} kills" bs-popover></i>',
        '</div>'
      ].join('')
    };
});
