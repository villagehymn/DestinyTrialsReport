/* globals BUCKET_HEAD:false, BUCKET_ARMS:false, BUCKET_CHEST:false, BUCKET_LEGS:false */
/* globals BUCKET_PRIMARY_WEAPON:false, BUCKET_SPECIAL_WEAPON:false, BUCKET_HEAVY_WEAPON:false */

'use strict';

function pushNode(node, nodes) {
  nodes.push({
    'nodeHash': node.nodeHash,
    'name': node.steps.nodeStepName,
    'description': node.steps.nodeStepDescription,
    'icon': 'https://www.bungie.net' + node.steps.icon,
    'row': node.row,
    'column': node.column
  });
}

function setHazard(perkHash, items, hazardArray, name) {
  if (hazardArray.indexOf(perkHash) > -1) {
    items.hazards.push(name);
  }
}

function setDefinition(object, index, armor) {
  object[index] = {
    'definition': armor
  };
}

function getDefinitionsByBucket(bucketHash) {
  switch (bucketHash) {
    case BUCKET_PRIMARY_WEAPON:
      return 'primary';
    case BUCKET_SPECIAL_WEAPON:
      return 'special';
    case BUCKET_HEAVY_WEAPON:
      return 'heavy';
    case BUCKET_HEAD:
      return 'head';
    case BUCKET_ARMS:
      return 'arms';
    case BUCKET_CHEST:
      return 'chest';
    case BUCKET_LEGS:
      return 'legs';
  }
}

function setNodes(item, nodes, definition, object, type) {
  for (var i = 0; i < item.nodes.length; i++) {
    if (item.nodes[i].isActivated === true && item.nodes[i].column > -1) {
      var node = item.nodes[i];
      var nodeSteps = node.steps;
      if (nodeSteps) {
        if (nodeSteps.nodeStepName && !nodeSteps.affectsQuality && (avoidNodes.indexOf(nodeSteps.nodeStepName) < 0)) {
          pushNode(node, nodes);
        }
      }
    }
  }

  if (type) {
    object[type] = {
      'definition': definition,
      'nodes': nodes
    };
  } else {
    object.nodes = nodes;
    object.definition = definition;
  }
}

function defineAbilities(subclass, hasFireboltGrenade, hasFusionGrenade, hasVikingFuneral, hasTouchOfFlame) {
  for (var s = 0; s < subclass.nodes.length; s++) {
    switch (subclass.nodes[s].column) {
      case 1:
        subclass.abilities.weaponKillsGrenade = subclass.nodes[s];
        subclass.displayedNodes[subclass.nodes[s].nodeHash] = subclass.nodes[s];
        if (subclass.nodes[s].nodeHash == FIREBOLT_GRENADE) {
          hasFireboltGrenade = true;
        } else if (subclass.nodes[s].nodeHash == FUSION_GRENADE) {
          hasFusionGrenade = true;
        }
        break;
      case 2:
        if (subclass.nodes[s].nodeHash === 3452380660) {
          subclass.blink = true;
        }
        break;
      case 3:
        if (subclass.nodes[s].row === 0) {
          subclass.abilities.weaponKillsSuper = subclass.nodes[s];
        } else {
          subclass.displayedNodes[subclass.nodes[s].nodeHash] = subclass.nodes[s];
        }
        break;
      case 4:
        if (subclass.nodes[s].row === 0) {
          subclass.abilities.weaponKillsMelee = subclass.nodes[s];
        }
        break;
      case 6:
        subclass.displayedNodes[subclass.nodes[s].nodeHash] = subclass.nodes[s];
        if (subclass.nodes[s].nodeHash == VIKING_FUNERAL) {
          hasVikingFuneral = true;
        }
        break;
      case 8:
        subclass.displayedNodes[subclass.nodes[s].nodeHash] = subclass.nodes[s];
        if (subclass.nodes[s].nodeHash == TOUCH_OF_FLAME) {
          hasTouchOfFlame = true;
        }
        break;
    }
  }
}

angular.module('trialsReportApp')
  .factory('inventoryStats', function () {
    var getData = function (items) {
      var weaponBuckets = [BUCKET_PRIMARY_WEAPON, BUCKET_SPECIAL_WEAPON, BUCKET_HEAVY_WEAPON];
      var armorBuckets = [BUCKET_HEAD, BUCKET_ARMS, BUCKET_CHEST, BUCKET_LEGS];
      var armors = {
          hazards: []
        }, hasStarfireProtocolPerk = false;
      var weapons = {
        primary: {},
        special: {},
        heavy: {},
        hazards: [],
        shotgun: false
      };
      var subclass = {
        abilities: {
          weaponKillsGrenade: {},
          weaponKillsSuper: {},
          weaponKillsMelee: {}
        },
        nodes: {},
        displayedNodes: {},
        hazards: [],
        blink: false
      };

      var hasFireboltGrenade = false, hasFusionGrenade = false,
        hasVikingFuneral = false, hasTouchOfFlame = false;

      for (var n = 0; n < items.length; n++) {
        var weaponNodes = [], item = items[n];
        var bucket = getDefinitionsByBucket(item.bucketHash);

        if (weaponBuckets.indexOf(item.bucketHash) > -1) {
          var weapon = DestinyWeaponDefinition[item.itemHash];
          if (weapon) {
            setNodes(item, weaponNodes, weapon, weapons, bucket);
            if ((weapon.subType === 12) && (weapon.name !== 'No Land Beyond')) {
              for (var i = 0; i < item.stats.length; i++) {
                if (item.stats[i].statHash === STAT_BASE_DAMAGE && item.stats[i].value > 16) {
                  if ((item.primaryStat.value * item.stats[i].value) > 8577) {
                    weapons.hazards.push('Revive Kill Sniper');
                  }
                }
              }
            } else if (weapon.subType === 7) {
              weapon.shotgun = true;
            }
          }
        } else if (armorBuckets.indexOf(item.bucketHash) > -1) {
          var armor = DestinyArmorDefinition[item.itemHash];
          if (armor) {
            for (var i = 0; i < item.perks.length; i++) {
              if (item.perks[i].isActive === true) {
                setHazard(item.perks[i].perkHash, armors, hazardQuickRevive, 'Quick Revive');
                setHazard(item.perks[i].perkHash, armors, hazardGrenadeOnSpawn, 'Grenade on Spawn');
                setHazard(item.perks[i].perkHash, armors, hazardDoubleGrenade, 'Double Grenade');
                hasStarfireProtocolPerk = (item.perks[i].perkHash === 3471016318);
              }
            }
            setDefinition(armors, bucket, armor);
          }
        } else {
          var subclassDefinition = DestinySubclassDefinition[item.itemHash];
          if (subclassDefinition) {
            var subclassNodes = [];
            setNodes(item, subclassNodes, subclassDefinition, subclass);
            defineAbilities(subclass, hasFireboltGrenade, hasFusionGrenade, hasVikingFuneral, hasTouchOfFlame);
          }
        }
        if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
          subclass.hazards.push('Superburn Grenade');
        }
      }

      return {
        weapons: weapons,
        armors: armors,
        subclass: subclass,
        hasStarfireProtocolPerk: hasStarfireProtocolPerk,
        hasFusionGrenade: hasFusionGrenade
      };
    };

    return {
      getData: getData
    };
  });
