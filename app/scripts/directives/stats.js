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
        '<div class="row ml-0 mr-0 mb-10" data-intro="Match win/loss history<br/><em>hover over the icons for details</em>"' +
        'data-position="right" chardin-show="{{showHelpOverlay}}">',
          '<div class="col-xs-12 pr-0 pl-0 text-center win-loss">',
            '<i class="fa fa-circle mr-3 {{$index < 7 ? (activities.length - $index ) > 18 ? \'hidden-xs hidden-md\' : \'\' : \'\'}}"' +
              'ng-repeat="str in activities track by $index"' +
              'ng-class="str.standing === 0 ? \'win\' : \'lose\'"' +
              'popover="K/D: {{str.kd}} with {{str.kills}} kills"' +
              'popover-title="{{str.date | date : format : medium}}"' +
              'popover-trigger="mouseenter"></i>',
          '</div>',
        '</div>'
      ].join('')
    };
});
