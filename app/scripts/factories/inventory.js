'use strict';

function pushNode(nodeStep, nodes) {
  nodes.push({
    'name': nodeStep.nodeStepName,
    'description': nodeStep.nodeStepDescription,
    'icon': 'https://www.bungie.net' + nodeStep.icon
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

function populateClassNode(noderStepper) {
  return {
    'name': noderStepper.nodeStepName,
    'description': noderStepper.nodeStepDescription,
    'icon': 'https://www.bungie.net' + noderStepper.icon
  };
}

function setClassNode(nodeStep, classNodes, nodeArray, type, skipFirstAndLast) {
  if (nodeArray.indexOf(nodeStep.column) > -1) {
    var condition = skipFirstAndLast ? !(nodeStep.row === 0 && nodeStep.column === 3) : (nodeStep.row === 0);
    if (condition) {
      var noderStepper = nodeStep.steps;
      if (type === 'all') {
        classNodes.push(populateClassNode(noderStepper));
      } else {
        classNodes.abilities[type] = populateClassNode(noderStepper);
      }
    }
  }
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
        hazards: []
      }, shotgun = false;
      var classNodes = [];
      classNodes.abilities = {};
      classNodes.hazards = [];

      var subClass = [], background = [], blink = false,
        hasFireboltGrenade = false, hasFusionGrenade = false,
        hasVikingFuneral = false, hasTouchOfFlame = false;

      for (var n = 0; n < items.length; n++) {
        var nodes = [], item = items[n];
        var bucket = getDefinitionsByBucket(item.bucketHash);

        if (weaponBuckets.indexOf(item.bucketHash) > -1) {
          var weapon = DestinyWeaponDefinition[item.itemHash];
          setNodes(item, nodes, weapon, weapons, bucket);

          if ((weapon.subType === 12) && (weapon.name !== 'No Land Beyond')) {
            for (var i = 0; i < item.stats.length; i++) {
              if (item.stats[i].statHash === STAT_BASE_DAMAGE && item.stats[i].value > 16) {
                if ((item.primaryStat.value * item.stats[i].value) > 8577) {
                  weapons.hazards.push('Revive Kill Sniper');
                }
              }
            }
          } else if (weapon.subType === 7) {
            shotgun = true;
          }
        } else if (armorBuckets.indexOf(item.bucketHash) > -1) {
          var armor = DestinyArmorDefinition[item.itemHash];
          for (var i = 0; i < item.perks.length; i++) {
            if (item.perks[i].isActive === true) {
              setHazard(item.perks[i].perkHash, armors, hazardQuickRevive, 'Quick Revive');
              setHazard(item.perks[i].perkHash, armors, hazardGrenadeOnSpawn, 'Grenade on Spawn');
              setHazard(item.perks[i].perkHash, armors, hazardDoubleGrenade, 'Double Grenade');
              hasStarfireProtocolPerk = (item.perks[i].perkHash === 3471016318);
            }
          }
          setDefinition(armors, bucket, armor);
        } else {
          var cItem = DestinyClassDefinition[item.itemHash];
          if (cItem) {
            subClass = {
              'name': cItem.name
            };

            for (var i = 0; i < item.nodes.length; i++) {
              if (item.nodes[i].isActivated === true) {
                var nodeStep = item.nodes[i];
                if (item.itemHash === SUNSINGER_CLASS) {
                  switch (nodeStep.nodeHash) {
                    case FIREBOLT_GRENADE:
                      hasFireboltGrenade = true;
                      break;
                    case FUSION_GRENADE:
                      hasFusionGrenade = true;
                      break;
                    case VIKING_FUNERAL:
                      hasVikingFuneral = true;
                      break;
                    case TOUCH_OF_FLAME:
                      hasTouchOfFlame = true;
                      break;
                  }
                }
                setClassNode(nodeStep, classNodes, [1], 'weaponKillsGrenade', true);
                setClassNode(nodeStep, classNodes, [3], 'weaponKillsSuper', false);
                setClassNode(nodeStep, classNodes, [4], 'weaponKillsMelee', false);
                setClassNode(nodeStep, classNodes, [1, 3, 6, 8], 'all', true);

                if (item.itemHash === VOIDWALKER_CLASS || item.itemHash === BLADEDANCER_CLASS) {
                  if (nodeStep.nodeHash === 3452380660) {
                    blink = (nodeStep.row === 3 && nodeStep.column === 2);
                  }
                }
              }
            }

            if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
              classNodes.hazards.push('Superburn Grenade');
            }
          } else if (item.itemLevel === 0 && DestinyEmblemDefinition[item.itemHash]) {
            background[0] = DestinyEmblemDefinition[item.itemHash].secondaryIcon;
            background[1] = DestinyEmblemDefinition[item.itemHash].icon;
          }
        }
      }

      return {
        weapons: weapons,
        armors: armors,
        shotgun: shotgun,
        classNodes: classNodes,
        subClass: subClass,
        bg: background,
        blink: blink,
        hasStarfireProtocolPerk: hasStarfireProtocolPerk,
        hasFusionGrenade: hasFusionGrenade
      };
    };

    return {
      getData: getData
    };
  });
