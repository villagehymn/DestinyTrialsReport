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
          '<div class="weapon col-xs-12" ng-repeat="weapon in weapons track by $index" ng-if="weapons">',
            '<div class="weapon__img">',
              '<img class="img-responsive" ng-src="{{\'https://www.bungie.net\' + weapon.definition.icon}}" alt="{{weapon.definition.name}}">',
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
              '<div class="weapon__label" ng-repeat="hazard in weapon.hazards" ng-bind="hazard">',
              '</div>',
            '</div>',
          '</div>'
      ].join('')
    };
  });
