/* globals BUCKET_HEAD:false, BUCKET_ARMS:false, BUCKET_CHEST:false, BUCKET_LEGS:false */
/* globals BUCKET_PRIMARY_WEAPON:false, BUCKET_SPECIAL_WEAPON:false, BUCKET_HEAVY_WEAPON:false */

'use strict';

function setHazard(perkHash, items, hazardArray, name) {
  if (hazardArray.indexOf(perkHash) > -1) {
    items.hazards.push(name);
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
      var armorBuckets = [BUCKET_HEAD, BUCKET_ARMS, BUCKET_CHEST, BUCKET_LEGS, BUCKET_ARTIFACT, BUCKET_GHOST];
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
          if ((definition.subType === 12) && (definition.name !== 'No Land Beyond')) {
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
            if (item.perks[i].isActive === true) {
              setHazard(item.perks[i].perkHash, armors, hazardQuickRevive, 'Quick Revive');
              setHazard(item.perks[i].perkHash, armors, hazardGrenadeOnSpawn, 'Grenade on Spawn');
              setHazard(item.perks[i].perkHash, armors, hazardDoubleGrenade, 'Double Grenade');
              hasStarfireProtocolPerk = (item.perks[i].perkHash === 3471016318);
            }
          }
          if (definition.tierType === 6 && item.bucketHash !== BUCKET_ARTIFACT) {
            bucket = 'exotic'
          }
          armors[bucket] = {
            'definition': definition,
            'nodes': item.nodes
          };
        } else if (item.bucketHash === BUCKET_BUILD) {
          definition = setItemDefinition(item, DestinySubclassDefinition);
          subclass.nodes = item.nodes;
          subclass.definition = definition;
          defineAbilities(subclass, hasFireboltGrenade, hasFusionGrenade, hasVikingFuneral, hasTouchOfFlame);
        }

        if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
          subclass.hazards.push('Superburn Grenade');
        }
      }

      //TODO: better way to handle no exotic armor
      if (!armors.exotic) {
        armors.exotic = armors.head;
        delete armors.head;
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
