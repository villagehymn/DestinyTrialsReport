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
            '<img class="img-responsive" ng-src="{{armor.definition.icon}}" alt="{{armor.definition.name}}"' +
                 'data-title="{{armor.definition.name}}" data-content="{{armor.definition.description}}" bs-popover>',
          '</div>',
        '</div>'
      ].join('')
    };
});
