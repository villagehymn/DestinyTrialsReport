'use strict';

function pushNode(nodeStep, nodes) {
  nodes.push({
    'name': nodeStep.nodeStepName,
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

function getDefinitionsByBucket(bucketHash) {
  switch (bucketHash) {
    case BUCKET_PRIMARY_WEAPON:
      return {file: DestinyWeaponDefinition, name: 'primary'};
    case BUCKET_SPECIAL_WEAPON:
      return {file: DestinyWeaponDefinition, name: 'special'};
    case BUCKET_HEAVY_WEAPON:
      return {file: DestinyWeaponDefinition, name: 'heavy'};
  }
}

function setNodes(itemS, nodes, object, weapons, type) {
  for (var i = 0; i < itemS.nodes.length; i++) {
    if (itemS.nodes[i].isActivated === true) {
      var nodeStep = itemS.nodes[i].steps;
      if (nodeStep) {
        if (nodeStep.nodeStepName && !nodeStep.affectsQuality && (avoidNodes.indexOf(nodeStep.nodeStepName) < 0)) {
          pushNode(nodeStep, nodes);
        } else if (burns.indexOf(nodeStep.nodeStepName) > -1) {
          setDmgElement(nodeStep, object);
        }
      }
    }
  }
  weapons[type] = {
    'definition': object,
    'nodes': nodes
  };
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
        var nodes = [], itemS = items[n];
        var definitions = getDefinitionsByBucket(itemS.bucketHash);

        if (definitions) {
          var weapon = definitions.file[itemS.itemHash];
          setNodes(itemS, nodes, weapon, weapons, definitions.name);

          if ((weapon.subType === 12) && (weapon.name !== 'No Land Beyond')) {
            for (var i = 0; i < itemS.stats.length; i++) {
              if (itemS.stats[i].statHash === STAT_BASE_DAMAGE && itemS.stats[i].value > 16) {
                if ((itemS.primaryStat.value * itemS.stats[i].value) > 8577) {
                  weapons.hazards.push('Revive Kill Sniper');
                }
              }
            }
          } else if (weapon.subType === 7) {
            shotgun = true;
          }
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
