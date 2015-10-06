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
          '<div class="player-armor" bs-popover="{title:armor.definition.name,content:armor.definition.description}">',
            '<span ng-if="armor.isExotic">Exotic</span>',
            '<img class="img-responsive" ng-src="{{\'https://www.bungie.net\' + armor.definition.icon}}" alt="{{armor.definition.name}}">',
          '</div>',
        '</div>'
      ].join('')
    };
});
