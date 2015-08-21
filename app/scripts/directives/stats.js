'use strict';

angular.module('trialsReportApp')
  .directive('trialsHistory', function() {
    return {
      restrict: 'A',
      scope: {
        activities: '=trialsHistory'
      },
      template: [
        '<div>' +
          '<i class="player-history__match"' +
            'ng-repeat="str in activities.slice().reverse() track by $index"' +
            'ng-class="str.standing === 0 ? \'player-history__match--win\' : \'player-history__match--loss\'"' +
            'bs-popover="{title:str.dateAgo,content:\'K/D: {{str.kd}} with {{str.kills}} kills\'}"></i>',
        '</div>'
      ].join('')
    };
});
