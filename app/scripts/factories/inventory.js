/* globals BUCKET_HEAD:false, BUCKET_ARMS:false, BUCKET_CHEST:false, BUCKET_LEGS:false */
/* globals BUCKET_PRIMARY_WEAPON:false, BUCKET_SPECIAL_WEAPON:false, BUCKET_HEAVY_WEAPON:false */

'use strict';

function setHazard(perkHash, object, constant) {
  var hazard;
  if (angular.isString(constant)) {
    hazard = constant;
  } else {
    hazard = constant[perkHash];
  }
  if (hazard) {
    if (angular.isArray(object)) {
      object.push(hazard);
    } else {
      object = hazard;
    }
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
        if (subclass.nodes[s].row !== 0) {
          subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        }
        subclass.blink = subclass.nodes[s].nodeStepHash === 3452380660;
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
        } else {
          subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        }
        break;
      case 6:
        subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        hasVikingFuneral = subclass.nodes[s].nodeStepHash == VIKING_FUNERAL;
        break;
      case 8:
        subclass.displayedNodes[subclass.nodes[s].nodeStepHash] = subclass.nodes[s];
        hasTouchOfFlame = subclass.nodes[s].nodeStepHash == TOUCH_OF_FLAME;
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

function setArmorHazards(armors, itemPerk, weapons) {
  armors.doubleGrenadeHash = hazardDoubleGrenadeByPerk[itemPerk.perkHash];
  setHazard(itemPerk.perkHash, armors.equipped.hazards, hazardMiscArmorPerks);
  setHazard(itemPerk.perkHash, armors.equipped.increasedArmor, hazardIncreasedArmor);
  setHazard(itemPerk.perkHash, armors.hazards, hazardBurnDefense);

  if (itemPerkToBucket[itemPerk.perkHash]) {
    weapons[itemPerkToBucket[itemPerk.perkHash]].hazards.push("Fast Reload");
  } else {
    var itemType = reloadPerksToItemType[itemPerk.perkHash];
    if (itemType) {
      var tempItem = weapons[itemTypeToBucket[itemType]];
      if (tempItem.definition.subType === itemType) {
        tempItem.hazards.push("Fast Reload");
      }
    }
  }
}

function setWeaponHazards(item, weapons, bucket, definition) {

  for (var w = 0; w < item.nodes.length; w++) {
    var itemNode = item.nodes[w];
    if (itemNode.isActivated) {
      for (var n = 0; n < itemNode.perkHashes.length; n++) {
        if (hazardMiscWeaponPerks.indexOf(itemNode.perkHashes[n]) > -1) {
          itemNode.isHazard = true;
        }
      }
    }
  }

  if ((definition.subType === 12)) {
    for (var s = 0; s < item.stats.length; s++) {
      if (item.stats[s].statHash === STAT_BASE_DAMAGE && item.stats[s].value > 20) {
        //if ((item.primaryStat.value * item.stats[i].value) > 8577) {
        weapons[bucket].hazards.push('Revive Kill');
        //}
      }
    }
  } else if (definition.subType === 7) {
    weapons.shotgun = true;
  }
}

angular.module('trialsReportApp')
  .factory('inventoryStats', function () {
    var getData = function (items) {
      var weaponBuckets = [BUCKET_PRIMARY_WEAPON, BUCKET_SPECIAL_WEAPON, BUCKET_HEAVY_WEAPON];
      var armorBuckets = [BUCKET_HEAD, BUCKET_ARMS, BUCKET_CHEST, BUCKET_LEGS, BUCKET_ARTIFACT, BUCKET_GHOST, BUCKET_CLASS_ITEM];
      var itemPerk;
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
          weapons[bucket].damage = item.primaryStat.value;
          setWeaponHazards(item, weapons, bucket, definition);

          for (var a = 0; a < weapons[bucket].nodes.length; a++) {
            var weaponPerk = weapons[bucket].nodes[a];
            if (weaponPerk.isHazard) {
              weapons[bucket].hazards.push(weaponPerk.name);
            }
          }

        } else if (armorBuckets.indexOf(item.bucketHash) > -1) {

          definition = setItemDefinition(item, DestinyArmorDefinition);
          for (var a = 0; a < item.perks.length; a++) {
            itemPerk = item.perks[a];
            if (itemPerk.isActive) {
              setArmorHazards(armors, itemPerk, weapons);
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
      }

      if ((subclass.grenadeHash === FIREBOLT_GRENADE) && hasVikingFuneral && hasTouchOfFlame) {
        subclass.hazards.push('Superburn Grenade');
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
