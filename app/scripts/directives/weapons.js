'use strict';
angular.module('trialsReportApp')
  .directive('weaponNodes', function() {
    return {
      restrict: 'A',
      scope: {
        weapons: '=weaponNodes',
        showHelpOverlay: '=showHelpOverlay'
      },
      template: [
        '<div class="row">',
          '<div class="weapon-wrapper col-xs-12 col-sm-4 col-md-12" ng-repeat="weapon in weapons track by $index">',
            '<div class="weapon__header">',
              '<span ng-if="$index === 0">Primary</span>',
              '<span ng-if="$index === 1">Special</span>',
              '<span ng-if="$index === 2">Heavy</span>',
            '</div>',
            '<div class="weapon">',
              '<div class="weapon__img">',
                '<img class="img-responsive {{weapon.weapon.burnColor || \'kinetic-dmg\'}}"' +
                    'ng-src="{{weapon.weapon.icon}}" alt="{{weapon.weapon.name}}">',
              '</div>',
              '<div class="weapon__info">',
                '<div class="weapon__title">',
                  '<span ng-bind="weapon.weapon.name"></span>',
                '</div>',
                '<div class="weapon__perks">',
                  '<div ng-if="showHelpOverlay" class="hidden-xs hidden-sm"' +
                    'data-intro="Unlocked and active weapon perks <br/><em>hover over the icons for the desciption</em>"' +
                    'data-position="right" chardin-show="{{$middle}}"></div>',
                    '<div class="weapon-perk" ng-repeat="node in weapon.nodes track by $index" ng-show="node.name" popover-title="{{node.name}}" popover="{{node.description}}" popover-append-to-body="true" popover-trigger="mouseenter">',
                      '<i class="weapon-perk__icon">',
                        '<img class="img-responsive" ng-src="{{node.icon || \'\'}}">',
                      '</i>',
                      //'<span class="text-left text-sm" ng-bind="node.name"></span>',
                    '</div>',
                  '</div>',
                '</div>',
              '</div>',
            '</div>',
          '</div>',
        '</div>'
      ].join('')
    };
});
