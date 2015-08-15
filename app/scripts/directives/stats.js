'use strict';
angular.module('trialsReportApp')
  .directive('trialsHistory', function() {
    return {
      restrict: 'A',
      scope: {
        activities: '=trialsHistory',
        showHelpOverlay: '=showHelpOverlay'
      },
      template: [
        '<div data-intro="Match win/loss history<br/><em>hover over the icons for details</em>"' +
          'data-position="right" chardin-show="{{showHelpOverlay}}">',
          '<i class="player-history__match {{$index < 7 ? (activities.length - $index ) > 18 ? \'hidden-xs hidden-md\' : \'\' : \'\'}}"' +
            'ng-repeat="str in activities.slice().reverse() track by $index"' +
            'ng-class="str.standing === 0 ? \'player-history__match--win\' : \'player-history__match--loss\'"' +
            'popover="K/D: {{str.kd}} with {{str.kills}} kills"' +
            'popover-title="{{str.date | date : format : medium}}"' +
            'popover-trigger="mouseenter" popover-append-to-body="true"></i>',
        '</div>'
      ].join('')
    };
});
