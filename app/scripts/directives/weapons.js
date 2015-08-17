'use strict';

angular.module('trialsReportApp')
  .directive('weaponNodes', function() {
    return {
      restrict: 'A',
      scope: {
        weapons: '=weaponNodes'
      },
      template: [
        '<div class="row">',
          '<div class="weapon-wrapper col-xs-12" ng-repeat="weapon in weapons track by $index">',
            '<div class="weapon__header">',
              '<span ng-if="$index === 0">Primary</span>',
              '<span ng-if="$index === 1">Special</span>',
              '<span ng-if="$index === 2">Heavy</span>',
            '</div>',
            '<div class="weapon">',
              '<div class="weapon__img">',
                '<img class="img-responsive {{weapon.definition.burnColor || \'kinetic-dmg\'}}"' +
                     'ng-src="{{weapon.definition.icon}}" alt="{{weapon.definition.name}}">',
              '</div>',
              '<div class="weapon__info">',
                '<div class="weapon__title">',
                  '<span ng-bind="weapon.definition.name"></span>',
                '</div>',
                '<div class="weapon__perks">',
                  '<div class="weapon-perk" ng-repeat="node in weapon.nodes track by $index" data-title="{{node.name}}" data-content="{{node.description}}" bs-popover>',
                    '<i class="weapon-perk__icon">',
                      '<img class="img-responsive" ng-src="{{node.icon}}">',
                    '</i>',
                  '</div>',
                '</div>',
              '</div>',
            '</div>',
          '</div>',
        '</div>'
      ].join('')
    };
});
