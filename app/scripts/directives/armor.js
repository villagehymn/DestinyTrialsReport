'use strict';

angular.module('trialsReportApp')
  .directive('armorList', function() {
    return {
      restrict: 'A',
      scope: {
        armors: '=armorList'
      },
      template: [
        '<div class="col-xs-2" ng-repeat="armor in armors track by $index" ng-if="armor">',
          '<div class="player-armor" bs-popover="{title:armor.definition.name,content:armor.definition.description}">',
            '<img class="img-responsive" ng-src="{{\'https://www.bungie.net\' + armor.definition.icon}}" alt="{{armor.definition.name}}">',
          '</div>',
        '</div>'
      ].join('')
    };
});
