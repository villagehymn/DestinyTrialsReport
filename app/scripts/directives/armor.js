'use strict';
angular.module('trialsReportApp')
  .directive('armorList', function() {
    return {
      restrict: 'A',
      scope: {
        armors: '=armorList'
      },
      template: [
        '<div class="col-xs-3" ng-repeat="armor in armors track by $index">',
          '<div class="gear-armor">',
            '<img popover="{{armor.armor.name}}" popover-append-to-body="true" popover-trigger="mouseenter" class="img-responsive" ng-src="{{armor.armor.icon}}">',
          '</div>',
        '</div>'
      ].join('')
    };
});
