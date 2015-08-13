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
        '<div class="row ml-0 mr-0 mt-10 weapon" style="height:130px" ng-repeat="weapon in weapons track by $index">',
          '<div class="col-xs-4 pt-10">',
            '<div class="mb-0">',
              '<div class="front p-0">',
              '<img popover="{{weapon.weapon.name}}" popover-trigger="mouseenter"' +
                'class="img-responsive weapon-img {{weapon.weapon.burnColor || \'kinetic-dmg\'}}"' +
                'ng-src="{{weapon.weapon.icon}}" alt="{{weapon.weapon.name}}">',
              '</div>',
            '</div>',
          '</div>',
          '<div class="col-xs-8 pt-10">',
            '<div ng-if="showHelpOverlay" class="hidden-xs hidden-sm"' +
            'style="width:224px; height:105px; position:absolute; z-index:-1"' +
            'data-intro="Unlocked and active weapon perks <br/><em>hover over the icons for the desciption</em>"' +
            'data-position="right" chardin-show="{{$middle}}"></div>',
            '<div class="row" ng-repeat="node in weapon.nodes track by $index" ng-show="node.name" popover="{{node.description}}" popover-trigger="mouseenter">',
              '<div class="col-xs-2">',
                '<a class="icon icon-darkgray lt m-0" style="width:22px; height:22px">',
                 '<img class="img-responsive" ng-src="{{node.icon || \'\'}}">',
                '</a>',
              '</div>',
              '<div class="col-xs-10">',
                '<span class="text-left text-sm" ng-bind="node.name"></span>',
              '</div>',
            '</div>',
          '</div>',
        '</div>'
      ].join('')
    };
});
