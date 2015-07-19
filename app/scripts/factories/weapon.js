'use strict';

angular.module('trialsReportApp')
  .factory('weaponStats', function($http) {
    var getData = function(items, talentGrid) {
      //return $http({method: 'GET', url: '/json/weapons.json'}).then(function (data) {
        var avoidNodes = ['Ascend', 'Reforge Ready', 'Void Damage', 'Arc Damage', 'Solar Damage', 'Kinetic Damage',
          'Hive Disruptor', 'Oracle Disruptor', 'Wolfpack Rounds', 'Last Word', 'Fan Fire', 'Mark of the Devourer',
          'Ice Breaker', 'No Backpack', 'Lich Bane', 'Invective', 'Cursebringer', 'Disciplinarian', 'Holding Aces',
          'Timeless Mythoclast', 'Thunderer'];
        var burns = ['Void Damage', 'Arc Damage', 'Solar Damage'];
        var shotgun = false;
        var weapons = [];
        weapons.hazards = [];
        angular.forEach(items, function (item) {
          var nodes = [];
          var itemS = item.items[0];
          //var wItem = data.data.items[itemS.itemHash];
          var wItem = weaponDefinitions[itemS.itemHash];
          if (wItem) {
            if (wItem.subType === 'Sniper Rifle') {
              angular.forEach(itemS.stats,function(stat){
                if (stat.statHash === 4043523819 && stat.value > 16){
                  if ((itemS.primaryStat.value * stat.value) > 8577){
                    weapons.hazards.push('Revive Kill Sniper');
                  }
                }
              });
            } else if (wItem.subType === 'Shotgun') {
              shotgun = true;
            }
            angular.forEach(itemS.nodes, function (node, index) {
              if (node.isActivated === true) {
                var nodeStep = talentGrid[itemS.talentGridHash].nodes[index].steps[node.stepIndex];
                if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                  var longNames = ['Grenades and Horseshoes'];
                  var name = (longNames.indexOf(nodeStep.nodeStepName) > -1) ? 'Nades & Shoes' : nodeStep.nodeStepName;
                  if (wItem.subType === 'Sniper Rifle') {
                    if (nodeStep.perkHashes[0] === 3752206822) {
                      weapons.hazards.push('Final Round Sniper');
                    }
                  }
                  nodes.push({
                    'name': name, 'description': nodeStep.nodeStepDescription,
                    'icon': 'http://www.bungie.net' + nodeStep.icon
                  });
                }else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                  switch (nodeStep.nodeStepName) {
                    case 'Solar Damage':
                      wItem.burnColor = 'solar-dmg';
                      break;
                    case 'Void Damage':
                      wItem.burnColor = 'void-dmg';
                      break;
                    case 'Arc Damage':
                      wItem.burnColor = 'arc-dmg';
                      break;
                  }
                }
              }
            });
            weapons[wItem.bucket] = wItem;
            weapons[wItem.bucket].nodes = nodes;
          }
        });
        return {weapons: weapons, shotgun: shotgun};
      //});
    };
    return { getData: getData };
  });
