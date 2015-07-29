'use strict';

angular.module('trialsReportApp')
  .factory('weaponStats', function() {

    function pushNode(nodeStep, name, nodes) {
      nodes.push({
        'name': name,
        'description': nodeStep.nodeStepDescription,
        'icon': 'http://www.bungie.net' + nodeStep.icon
      });
    }

    function setDmgElement(nodeStep, weapon) {
      switch (nodeStep.nodeStepName) {
        case 'Solar Damage':
          weapon.burnColor = 'solar-dmg';
          break;
        case 'Void Damage':
          weapon.burnColor = 'void-dmg';
          break;
        case 'Arc Damage':
          weapon.burnColor = 'arc-dmg';
          break;
      }
    }

    var getData = function (items, talentGrid) {
      var avoidNodes = ['Ascend', 'Reforge Ready', 'Void Damage', 'Arc Damage', 'Solar Damage', 'Kinetic Damage',
        'Hive Disruptor', 'Oracle Disruptor', 'Wolfpack Rounds', 'Last Word', 'Fan Fire', 'Mark of the Devourer',
        'Ice Breaker', 'No Backpack', 'Lich Bane', 'Invective', 'Cursebringer', 'Disciplinarian', 'Holding Aces',
        'Timeless Mythoclast', 'Thunderer'];
      var burns = ['Void Damage', 'Arc Damage', 'Solar Damage'];
      var shotgun = false;
      var weapons = {};
      weapons.primary = {};
      weapons.special = {};
      weapons.heavy = {};
      weapons.hazards = [];
      angular.forEach(items, function (item) {
        if (angular.isObject(weapons.primary) && weapons.special && weapons.heavy)
        var nodes = [];
        var itemS = item.items[0];
        //var wItem = DestinyPrimaryWeaponDefinitions[itemS.itemHash];

        if (DestinyPrimaryWeaponDefinitions[itemS.itemHash]) {
          var primaryW = DestinyPrimaryWeaponDefinitions[itemS.itemHash];
          angular.forEach(itemS.nodes, function (node, index) {
            if (node.isActivated === true) {
              var nodeStep = talentGrid[itemS.talentGridHash].nodes[index].steps[node.stepIndex];
              if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                pushNode(nodeStep, nodeStep.nodeStepName, nodes);
              } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                setDmgElement(nodeStep, primaryW);
              }
            }
          });
          weapons.primary = {'weapon': primaryW, 'nodes': nodes};
        }else if (DestinySpecialWeaponDefinitions[itemS.itemHash]){
          var secondaryW = DestinySpecialWeaponDefinitions[itemS.itemHash];
          if ((secondaryW.subType === 'Sniper Rifle') && (secondaryW.name !== 'No Land Beyond')) {
            angular.forEach (itemS.stats, function (stat) {
              if (stat.statHash === 4043523819 && stat.value > 16) {
                if ((itemS.primaryStat.value * stat.value) > 8577) {
                  weapons.hazards.push('Revive Kill Sniper');
                }
              }
            });
          } else if (secondaryW.subType === 'Shotgun') {
            shotgun = true;
          }
          angular.forEach(itemS.nodes, function (node, index) {
            if (node.isActivated === true) {
              var nodeStep = talentGrid[itemS.talentGridHash].nodes[index].steps[node.stepIndex];
              if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                if (secondaryW.subType === 'Sniper Rifle') {
                  if (nodeStep.perkHashes[0] === 3752206822) {
                    weapons.hazards.push('Final Round Sniper');
                  }
                }
                pushNode(nodeStep, nodeStep.nodeStepName, nodes);
              } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                setDmgElement(nodeStep, secondaryW);
              }
            }
          });
          weapons.special = {'weapon': secondaryW, 'nodes': nodes};
        }else if (DestinyHeavyWeaponDefinitions[itemS.itemHash]){
          var heavyW = DestinyHeavyWeaponDefinitions[itemS.itemHash];
          angular.forEach(itemS.nodes, function (node, index) {
            if (node.isActivated === true) {
              var nodeStep = talentGrid[itemS.talentGridHash].nodes[index].steps[node.stepIndex];
              if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                var longNames = ['Grenades and Horseshoes'];
                var name = (longNames.indexOf(nodeStep.nodeStepName) > -1) ? 'Nades & Shoes' : nodeStep.nodeStepName;
                pushNode(nodeStep, name, nodes);
              } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                setDmgElement(nodeStep, heavyW);
              }
            }
          });
          weapons.heavy = {'weapon': heavyW, 'nodes': nodes};
        }
      });
      return {weapons: weapons, shotgun: shotgun};
    };
    return {getData: getData};
  });
