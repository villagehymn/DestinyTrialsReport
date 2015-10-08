/* globals BUCKET_HEAD:false, BUCKET_ARMS:false, BUCKET_CHEST:false, BUCKET_LEGS:false */
/* globals BUCKET_PRIMARY_WEAPON:false, BUCKET_SPECIAL_WEAPON:false, BUCKET_HEAVY_WEAPON:false */

'use strict';

function setHazard(perkHash, items) {
  if (hazardQuickRevive.indexOf(perkHash) > -1) {
    items.hazards.push('Quick Revive');
  }
  if (hazardGrenadeOnSpawn.indexOf(perkHash) > -1) {
    items.hazards.push('Grenade on Spawn');
  }
  if (hazardDoubleGrenade.indexOf(perkHash) > -1) {
    items.hazards.push('Double Grenade');
  }
}

function getDefinitionsByBucket(bucketHash) {
  switch (bucketHash) {
    case BUCKET_PRIMARY_WEAPON: return 'primary';
    case BUCKET_SPECIAL_WEAPON: return 'special';
    case BUCKET_HEAVY_WEAPON:   return 'heavy';
    case BUCKET_HEAD:           return 'head';
    case BUCKET_ARMS:           return 'arms';
    case BUCKET_CHEST:          return 'chest';
    case BUCKET_LEGS:           return 'legs';
    case BUCKET_ARTIFACT:       return 'artifact';
    case BUCKET_GHOST:          return 'ghost';
    case BUCKET_CLASS_ITEM:     return 'classItem';
  }
}

function defineAbilities(subclass, hasFireboltGrenade, hasFusionGrenade, hasVikingFuneral, hasTouchOfFlame) {
  for (var s = 0; s < subclass.nodes.length; s++) {
    switch (subclass.nodes[s].column) {
      case 1:
        subclass.abilities.weaponKillsGrenade = subclass.nodes[s];
        subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        subclass.grenadeHash = subclass.nodes[s].nodeStepHash;
        if (subclass.nodes[s].nodeStepHash == FIREBOLT_GRENADE) {
          hasFireboltGrenade = true;
        } else if (subclass.nodes[s].nodeStepHash == FUSION_GRENADE) {
          hasFusionGrenade = true;
        }
        break;
      case 2:
        if (subclass.nodes[s].nodeStepHash === 3452380660) {
          subclass.blink = true;
        }
        break;
      case 3:
        if (subclass.nodes[s].row === 0) {
          subclass.abilities.weaponKillsSuper = subclass.nodes[s];
        } else {
          subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        }
        break;
      case 4:
        if (subclass.nodes[s].row === 0) {
          subclass.abilities.weaponKillsMelee = subclass.nodes[s];
        }
        break;
      case 6:
        subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        if (subclass.nodes[s].nodeStepHash == VIKING_FUNERAL) {
          hasVikingFuneral = true;
        }
        break;
      case 8:
        subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        if (subclass.nodes[s].nodeStepHash == TOUCH_OF_FLAME) {
          hasTouchOfFlame = true;
        }
        break;
    }
  }
}

function setItemDefinition(item, definition) {
  if (item.itemHash in definition) {
    return definition[item.itemHash];
  } else {
    return {name: 'Classified', description: 'Classified', icon: '/img/misc/missing_icon.png', subType: 0};
  }
}

angular.module('trialsReportApp')
  .factory('inventoryStats', function () {
    var getData = function (items) {
      var weaponBuckets = [BUCKET_PRIMARY_WEAPON, BUCKET_SPECIAL_WEAPON, BUCKET_HEAVY_WEAPON];
      var armorBuckets = [BUCKET_HEAD, BUCKET_ARMS, BUCKET_CHEST, BUCKET_LEGS, BUCKET_ARTIFACT, BUCKET_GHOST, BUCKET_CLASS_ITEM];
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
        var item = items[n], bucket = getDefinitionsByBucket(item.bucketHash);
        var definition;
        if (weaponBuckets.indexOf(item.bucketHash) > -1) {
          definition = setItemDefinition(item, DestinyWeaponDefinition);
          weapons[bucket] = {
            'definition': definition,
            'nodes': item.nodes
          };
          if ((definition.subType === 12)) {
            for (var i = 0; i < item.stats.length; i++) {
              if (item.stats[i].statHash === STAT_BASE_DAMAGE && item.stats[i].value > 16) {
                if ((item.primaryStat.value * item.stats[i].value) > 8577) {
                  weapons.hazards.push('Revive Kill Sniper');
                }
              }
            }
          } else if (definition.subType === 7) {
            weapons.shotgun = true;
          }
        } else if (armorBuckets.indexOf(item.bucketHash) > -1) {
          definition = setItemDefinition(item, DestinyArmorDefinition);
          for (var i = 0; i < item.perks.length; i++) {
            if (item.perks[i].isActive) {
              setHazard(item.perks[i].perkHash, armors);
              hasStarfireProtocolPerk = (item.perks[i].perkHash === 3471016318);
              armors.doubleGrenadeHash = hazardDoubleGrenadeByPerk[item.perks[i].perkHash];
              if (itemPerkToBucket[item.perks[i].perkHash]) {
                weapons[itemPerkToBucket[item.perks[i].perkHash]].increasedReload = true;
              } else {
                var reloadPerk = reloadPerksToItemType[item.perks[i].perkHash];
                if (reloadPerk) {
                  var tempItem = weapons[itemTypeToBucket[reloadPerk]];
                  tempItem.increasedReload = (tempItem.definition.subType === reloadPerk);
                }
              }
            }
          }
          if (definition.tierType === 6 && item.bucketHash !== BUCKET_CLASS_ITEM) {
            armors.equipped = {
              'definition': definition,
              'nodes': item.nodes
            };
          }
          if (!armors.equipped && item.bucketHash === BUCKET_HEAD) {
            armors.equipped = {
              'definition': definition,
              'nodes': item.nodes
            };
          }
        } else if (item.bucketHash === BUCKET_BUILD) {
          definition = setItemDefinition(item, DestinySubclassDefinition);
          subclass.nodes = item.nodes;
          subclass.definition = definition;
          defineAbilities(subclass, hasFireboltGrenade, hasFusionGrenade, hasVikingFuneral, hasTouchOfFlame);
        }

        if (armors.doubleGrenadeHash) {
          if (armors.doubleGrenadeHash ===  subclass.grenadeHash) {
            armors.hazards.push('Double Grenade');
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
