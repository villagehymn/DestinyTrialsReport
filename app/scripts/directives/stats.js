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
            'popover="K/D: {{str.kd}} with {{str.kills}} kills"' +
            'popover-title="{{str.dateAgo}}"' +
            'popover-trigger="mouseenter" popover-append-to-body="true"></i>',
        '</div>'
      ].join('')
    };
});
