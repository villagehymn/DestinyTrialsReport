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

function defineAbilities(subclass, hasVikingFuneral, hasTouchOfFlame) {
  for (var s = 0; s < subclass.nodes.length; s++) {
    switch (subclass.nodes[s].column) {
      case 1:
        subclass.abilities.weaponKillsGrenade = subclass.nodes[s];
        subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        subclass.grenadeHash = subclass.nodes[s].nodeStepHash;
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
          hazards: [],
          equipped: {
            hazards: []
          }
        };
      var weapons = {
        primary: {
          hazards: []
        },
        special: {
          hazards: []
        },
        heavy: {
          hazards: []
        },
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

      var hasVikingFuneral = false, hasTouchOfFlame = false;

      for (var n = 0; n < items.length; n++) {
        var item = items[n], bucket = getDefinitionsByBucket(item.bucketHash);
        var definition;
        if (weaponBuckets.indexOf(item.bucketHash) > -1) {
          definition = setItemDefinition(item, DestinyWeaponDefinition);
          weapons[bucket].definition = definition;
          weapons[bucket].nodes = item.nodes;
          for (var i = 0; i < item.perks.length; i++) {
            if (item.perks[i].isActive) {
              if (hazardMiscWeaponPerks[item.perks[i].perkHash]) {
                weapons[bucket].hazards.push(hazardMiscWeaponPerks[item.perks[i].perkHash]);
              }
            }
          }
          if ((definition.subType === 12)) {
            for (var i = 0; i < item.stats.length; i++) {
              if (item.stats[i].statHash === STAT_BASE_DAMAGE && item.stats[i].value > 20) {
                //if ((item.primaryStat.value * item.stats[i].value) > 8577) {
                if (weapons[bucket].hazards.length > 1){
                  weapons[bucket].hazards[1] = 'Revive Kill';
                } else {
                  weapons[bucket].hazards.push('Revive Kill');
                }
                //}
              }
            }
          } else if (definition.subType === 7) {
            weapons.shotgun = true;
          }
        } else if (armorBuckets.indexOf(item.bucketHash) > -1) {
          definition = setItemDefinition(item, DestinyArmorDefinition);
          for (var i = 0; i < item.perks.length; i++) {
            if (item.perks[i].isActive) {
              //setHazard(item.perks[i].perkHash, armors);
              armors.doubleGrenadeHash = hazardDoubleGrenadeByPerk[item.perks[i].perkHash];
              if (hazardMiscArmorPerks[item.perks[i].perkHash]) {
                armors.equipped.hazards.push(hazardMiscArmorPerks[item.perks[i].perkHash]);
              }
              if (hazardIncreasedArmor[item.perks[i].perkHash]) {
                armors.equipped.increasedArmor = hazardIncreasedArmor[item.perks[i].perkHash];
              }
              if (hazardBurnDefense[item.perks[i].perkHash]) {
                armors.hazards.push(hazardBurnDefense[item.perks[i].perkHash] + ' Burn Res');
              }
              if (itemPerkToBucket[item.perks[i].perkHash]) {
                weapons[itemPerkToBucket[item.perks[i].perkHash]].hazards.push("Increased Reload");
              } else {
                var reloadPerk = reloadPerksToItemType[item.perks[i].perkHash];
                if (reloadPerk) {
                  var tempItem = weapons[itemTypeToBucket[reloadPerk]];
                  if (tempItem.definition.subType === reloadPerk) {
                    tempItem.hazards.push("Increased Reload");
                  }
                }
              }
            }
          }
          if (definition.tierType === 6 && item.bucketHash !== BUCKET_CLASS_ITEM) {
            armors.equipped.definition = definition;
            armors.equipped.nodes = item.nodes;
          }
          if (!armors.equipped.definition && item.bucketHash === BUCKET_HEAD) {
            armors.equipped.definition = definition;
            armors.equipped.nodes = item.nodes;
          }
        } else if (item.bucketHash === BUCKET_BUILD) {
          definition = setItemDefinition(item, DestinySubclassDefinition);
          subclass.nodes = item.nodes;
          subclass.definition = definition;
          subclass.definition.itemHash = item.itemHash;
          defineAbilities(subclass, hasVikingFuneral, hasTouchOfFlame);
        }
        if ((subclass.grenadeHash === FIREBOLT_GRENADE) && hasVikingFuneral && hasTouchOfFlame) {
          subclass.hazards.push('Superburn Grenade');
        }
      }
      if (armors.equipped.increasedArmor) {
        if (armors.equipped.increasedArmor.indexOf(subclass.definition.itemHash) > -1) {
          armors.hazards.push('Increased Armor');
        }
      }
      if (armors.doubleGrenadeHash) {
        if (armors.doubleGrenadeHash === subclass.grenadeHash) {
          armors.hazards.push('Double Grenade');
        }
      }
      return {
        weapons: weapons,
        armors: armors,
        subclass: subclass
      };
    };

    return {
      getData: getData
    };
  });
