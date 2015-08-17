'use strict';

var burns = ['Void Damage', 'Arc Damage', 'Solar Damage'];
var avoidNodes = [
  'Ascend', 'Reforge Ready', 'Void Damage', 'Arc Damage', 'Solar Damage', 'Kinetic Damage',
  'Hive Disruptor', 'Oracle Disruptor', 'Lich Bane', 'Disciplinarian'
];

function pushNode(nodeStep, name, nodes) {
  nodes.push({
    'name': name,
    'description': nodeStep.nodeStepDescription,
    'icon': 'https://www.bungie.net' + nodeStep.icon
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

angular.module('trialsReportApp')
  .factory('weaponStats', function () {
    var getData = function (items) {
      var weapons = {};
      var shotgun = false;

      weapons.primary = {};
      weapons.special = {};
      weapons.heavy = {};
      weapons.hazards = [];

      for (var n = 0; n < items.length; n++) {
        if (weapons.primary.length && weapons.special.length && weapons.heavy.length) {
          return;
        }
        var nodes = [];
        var itemS = items[n];
        //var wItem = DestinyPrimaryWeaponDefinitions[itemS.itemHash];

        if (DestinyPrimaryWeaponDefinitions[itemS.itemHash]) {
          var primaryW = DestinyPrimaryWeaponDefinitions[itemS.itemHash];
          for (var i = 0; i < itemS.nodes.length; i++) {
            if (itemS.nodes[i].isActivated === true) {
              var nodeStep = itemS.nodes[i].steps;
              if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                pushNode(nodeStep, nodeStep.nodeStepName, nodes);
              } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                setDmgElement(nodeStep, primaryW);
              }
            }
          }
          weapons.primary = {
            'weapon': primaryW,
            'nodes': nodes
          };
        } else if (DestinySpecialWeaponDefinitions[itemS.itemHash]) {
          var secondaryW = DestinySpecialWeaponDefinitions[itemS.itemHash];
          for (var i = 0; i < itemS.nodes.length; i++) {
            if (itemS.nodes[i].isActivated === true) {
              var nodeStep = itemS.nodes[i].steps;
              if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                if (secondaryW.subType === 12) {
                  if (nodeStep.perkHashes[0] === 3752206822) {
                    weapons.hazards.push('Final Round Sniper');
                  }
                }
                pushNode(nodeStep, nodeStep.nodeStepName, nodes);
              } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                setDmgElement(nodeStep, secondaryW);
              }
            }
          }
          weapons.special = {
            'weapon': secondaryW,
            'nodes': nodes
          };
          if ((secondaryW.subType === 12) && (secondaryW.name !== 'No Land Beyond')) {
            for (var i = 0; i < itemS.stats.length; i++) {
              if (itemS.stats[i].statHash === 4043523819 && itemS.stats[i].value > 16) {
                if ((itemS.primaryStat.value * itemS.stats[i].value) > 8577) {
                  weapons.hazards.push('Revive Kill Sniper');
                }
              }
            }
          } else if (secondaryW.subType === 7) {
            shotgun = true;
          }
        } else if (DestinyHeavyWeaponDefinitions[itemS.itemHash]) {
          var heavyW = DestinyHeavyWeaponDefinitions[itemS.itemHash];
          for (var i = 0; i < itemS.nodes.length; i++) {
            if (itemS.nodes[i].isActivated === true) {
              var nodeStep = itemS.nodes[i].steps;
              if (!nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
                pushNode(nodeStep, nodeStep.nodeStepName, nodes);
              } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
                setDmgElement(nodeStep, heavyW);
              }
            }
          }
          weapons.heavy = {
            'weapon': heavyW,
            'nodes': nodes
          };
        }
      }

      return {
        weapons: weapons,
        shotgun: shotgun
      };
    };

    return {
      getData: getData
    };
  });
