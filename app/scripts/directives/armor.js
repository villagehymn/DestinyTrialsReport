'use strict';
angular.module('trialsReportApp')
  .directive('armorList', function() {
    return {
      restrict: 'A',
      scope: {
        armors: '=armorList'
      },
      template: [
        '<div class="col-md-3 col-xs-3" ng-repeat="armor in armors track by $index">',
          '<div class="card">',
            '<div class="front p-0">',
              '<img popover="{{armor.armor.name}}" popover-trigger="mouseenter" class="img-responsive" ng-src="{{armor.armor.icon}}">',
            '</div>',
          '</div>',
        '</div>'
      ].join('')
    };
});
