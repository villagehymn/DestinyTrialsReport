'use strict';

angular.module('trialsReportApp')
  .directive('armorNodes', function() {
    return {
      restrict: 'A',
      scope: {
        exoticArmor: '=armorNodes',
        hasExotic: '=hasExotic'
      },
      templateUrl: 'components/inventory/armor.template.html'
    };
  })
  .directive('weaponNodes', function() {
    return {
      restrict: 'A',
      scope: {
        weapons: '=weaponNodes'
      },
      templateUrl: 'components/inventory/weapons.template.html'
    };
  });
