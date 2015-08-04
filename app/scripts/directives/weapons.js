'use strict';
angular.module('trialsReportApp')
  .directive('weaponNodes', function() {
    return {
      //controller: MainCtrl,
      //controllerAs: 'weapon',
      //bindToController: true,
      restrict: 'A',
      scope: {
        weapons: '=weaponNodes',
        isMiddle: '=isMiddle'
      },
      template: [
        '<div class="row ml-0 mr-0 weapon" style="height:130px" ng-repeat="weapon in weapons track by $index">',
          '<div class="col-xs-4 pt-10">',
            '<div class="card mb-0">',
              '<div class="front p-0">',
              '<img popover="{{weapon.weapon.name}}" popover-trigger="mouseenter"' +
                'class="img-responsive weapon-img {{weapon.weapon.burnColor || \'kinetic-dmg\'}}"' +
                'ng-src="{{weapon.weapon.icon}}" alt="{{weapon.weapon.name}}">',
              '</div>',
            '</div>',
          '</div>',
          '<div class="col-xs-8 pt-10">',
            '<div ng-if="isMiddle" class="hidden-xs hidden-sm"' +
            'style="width:224px; height:105px; position:absolute; z-index:-1"' +
            'data-intro="Unlocked and active weapon perks <br/><em>hover over the icons for the desciption</em>"' +
            'data-position="right" ng-attr-data-opts="hidden-xs hidden-sm {{$middle ? \'\' : \'hidden\'}}"></div>',
            '<div class="row" ng-repeat="node in weapon.nodes" ng-show="node.name" popover="{{node.description}}" popover-trigger="mouseenter">',
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

//(function() {
//  'use strict';
//
//
//  angular.module('trialsReportApp').directive('weaponNodes', Loadout);
//
//  Loadout.$inject = ['weaponNodesService'];
//
//  function Loadout(weaponNodesService) {
//    return {
//      controller: MainCtrl,
//      controllerAs: 'weapon',
//      bindToController: true,
//      link: Link,
//      restrict: 'A',
//      scope: {},
//      template: [
//        '<div class="row" ng-repeat="node in weapon.nodes" ng-show="node.name" popover="{{node.description}}" popover-trigger="mouseenter">',
//          '<div class="col-xs-2">',
//            '<a class="icon icon-darkgray lt m-0" style="width:22px; height:22px">',
//              '<img class="img-responsive" ng-src="{{node.icon || \'\'}}">',
//            '</a>',
//          '</div>',
//          '<div class="col-xs-10">',
//            '<span class="text-left text-sm" ng-bind="node.name"></span>',
//          '</div>',
//        '</div>'
//      ].join('')
//    };
//
//    function Link(scope, element, attrs) {
//      //var vm = scope.vm;
//      //
//      //vm.classTypeValues = [{
//      //  label: 'Any',
//      //  value: -1
//      //}, {
//      //  label: 'Warlock',
//      //  value: 0
//      //}, {
//      //  label: 'Titan',
//      //  value: 1
//      //}, {
//      //  label: 'Hunter',
//      //  value: 2
//      //}];
//      //
//      //vm.classList = {
//      //  'loadout-create': true
//      //};
//      //
//      //scope.$on('dim-create-new-loadout', function(event, args) {
//      //  vm.show = true;
//      //  dimLoadoutService.dialogOpen = true;
//      //
//      //  vm.loadout = angular.copy(vm.defaults);
//      //});
//      //
//      //scope.$on('dim-delete-loadout', function(event, args) {
//      //  vm.show = false;
//      //  dimLoadoutService.dialogOpen = false;
//      //  vm.loadout = angular.copy(vm.defaults);
//      //});
//      //
//      //scope.$on('dim-edit-loadout', function(event, args) {
//      //  if (args.loadout) {
//      //    vm.show = true;
//      //    dimLoadoutService.dialogOpen = true;
//      //    vm.loadout = args.loadout;
//      //  }
//      //});
//      //
//      //scope.$on('dim-store-item-clicked', function(event, args) {
//      //  vm.add(args.item);
//      //});
//    }
//  }
//
//  MainCtrl.$inject = ['weaponNodesService'];
//})();
