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
              '<span ng-if="$first">Primary</span>',
              '<span ng-if="$middle">Special</span>',
              '<span ng-if="$last">Heavy</span>',
            '</div>',
            '<div class="weapon">',
              '<div class="weapon__img">',
                '<img class="img-responsive" ng-src="{{weapon.definition.icon}}" alt="{{weapon.definition.name}}">',
              '</div>',
              '<div class="weapon__info">',
                '<div class="weapon__title">',
                  '<span ng-bind="weapon.definition.name"></span>',
                '</div>',
                '<div class="weapon__perks">',
                  '<div class="weapon-perk" ng-repeat="node in weapon.nodes track by $index" bs-popover="{title:node.name,content:node.description}">',
                    '<i class="weapon-perk__icon">',
                      '<img class="img-responsive" ng-src="{{node.icon}}" alt="{{node.name}}">',
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
